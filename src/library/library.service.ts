import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './schema/book.schema';
import { BorrowedBook } from './schema/borrowedbook.schema';
import { ReturnedBook } from './schema/return-book.schema';
import { SearchBooksDto } from './dto/book-search.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/schema/user.schema';
import { Queue } from './schema/queue.schema';
import { OverdueBook } from './schema/overdue-book.schema';
import * as schedule from 'node-schedule';
import { CronJob } from 'cron';
import { sendEmail } from './utils';
import * as ExcelJS from 'exceljs';
import { Fine } from './schema/fine.schema';
import { BorrowedBooksFilterDto } from './dto/borrowedbookfiler.dto';
import { CONSTRAINTS } from 'cron/dist/constants';
@Injectable()
export class BooksService {
  private static borrowedBookCounter = 1;
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(BorrowedBook.name)
    private readonly borrowedBookModel: Model<BorrowedBook>,
    @InjectModel(ReturnedBook.name)
    private readonly returnedBookModel: Model<BorrowedBook>,
    @InjectModel(OverdueBook.name)
    private readonly overdueBookModel: Model<OverdueBook>,
    @InjectModel(Queue.name)
    private readonly queueModel: Model<Queue>,
    @InjectModel(Fine.name)
    private readonly fineModel: Model<Fine>,
  ) {
    this.scheduleTask();
  }

  private formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1); // Month is zero-based, so add 1
    const day = this.padZero(date.getDate());
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());

    return `${year}-${month}-${day} / ${hours}:${minutes}`;
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    // Find the book with the highest bookid
    const latestBook = await this.bookModel
      .findOne({}, { bookid: 1 })
      .sort({ _id: -1 })
      .exec();

    let nextBookIdNumberING = 1;

    if (latestBook && latestBook.bookid) {
      const lastBookIdNumber = parseInt(latestBook.bookid.split('-')[1], 10);

      if (!isNaN(lastBookIdNumber)) {
        nextBookIdNumberING = lastBookIdNumber + 1;
      }
    }

    const newBookId = `LTB-${nextBookIdNumberING}`;
    const newBookData = { ...createBookDto, bookid: newBookId };
    const newBook = new this.bookModel(newBookData);
    return await newBook.save();
  }

  async updateBook(
    id: string,
    updateBookDto: CreateBookDto,
  ): Promise<Book | null> {
    return await this.bookModel.findByIdAndUpdate(id, updateBookDto, {
      new: true,
    });
  }

  private scheduleTask() {
    const cronJob = new CronJob('*/2 * * * *', () => {
      // Perform your task here
      this.checkForOverdueBooks();
    });

    cronJob.start();
  }

  async getAllBooks(): Promise<Book[]> {
    return this.bookModel.find().sort({ _id: -1 }).exec();
  }

  async getBookById(id: string): Promise<Book | null> {
    return this.bookModel.findById(id).exec();
  }

  async searchBooksByCriteria(criteria: SearchBooksDto): Promise<Book[]> {
    const query = {} as any;

    if (criteria.title) {
      query.title = { $regex: new RegExp(`${criteria.title}`, 'i') }; // Case-insensitive title search
    }
    if (criteria.department) {
      query.department = { $regex: new RegExp(`^${criteria.department}`, 'i') };
    }
    if (criteria.author) {
      query.author = { $regex: new RegExp(`^${criteria.author}`, 'i') }; // Case-insensitive author search
    }

    return await this.bookModel.find(query).exec();
  }

  private getNextBorrowedBookid() {
    const newBorrowedBookid = `b-${BooksService.borrowedBookCounter}`;
    BooksService.borrowedBookCounter++;
    return newBorrowedBookid;
  }

  async borrowBook(userId, bookId) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const book = await this.bookModel.findById(bookId).exec();

    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }
    if (book.total > 0) {
      // Fetch the latest borrowedBookId
      const latestBorrowedBook = await this.borrowedBookModel
        .findOne({}, { borrowedBookid: 1 })
        .sort({ _id: -1 })
        .exec();
      const borrowDate = new Date();
      const returnDate = new Date(borrowDate.getTime() + 10 * 60 * 1000);

      const formattedBorrowDate = this.formatDateTime(new Date());
      const formattedReturnDate = this.formatDateTime(returnDate);

      let nextBorrowedBookNumber = 1;

      if (latestBorrowedBook && latestBorrowedBook.borrowedBookid) {
        const lastBorrowedBookNumber = parseInt(
          latestBorrowedBook.borrowedBookid.split('-')[1],
          10,
        );

        nextBorrowedBookNumber = lastBorrowedBookNumber + 1;
      }

      const newBorrowedBookid = `b-${nextBorrowedBookNumber}`;

      const borrowedBook = new this.borrowedBookModel({
        title: book.title,
        author: book.author,
        department: book.department,
        total: 1,
        borrowDate: formattedBorrowDate,
        returnDate: formattedReturnDate,
        returned: false,
        overdue: false,
        book: book._id,
        user: user._id,
        bookid: book.bookid,
        userid: user.userid,
        username: user.username,
        borrowedBookid: newBorrowedBookid, // Set the new borrowedBookid
      });

      await borrowedBook.save();
      await sendEmail(
        user.email, // Assuming your user model has an 'email' field
        'Book Borrowed Successfully',
        `You have successfully borrowed the book:
         Title: ${book.title}
         BorrowedBookId:${borrowedBook.borrowedBookid}
         Author: ${book.author}
         Return Date: ${formattedReturnDate}`,
      );

      book.total--;

      if (book.total === 0) {
        book.available = false;
      }

      await book.save();

      await this.queueModel
        .findOneAndRemove({ user: user._id, book: book._id })
        .exec();

      return borrowedBook;
    } else {
      const queueEntry = new this.queueModel({
        user: user.username,
        book: book.title,
        author: book.author,
        date: new Date(),
      });

      await queueEntry.save();

      throw new NotFoundException(
        'This book is not available at the moment. You will be added to a queue and notified of its availability.',
      );
    }
  }

  private async checkForOverdueBooks() {
    console.log('Checking for overdue books...');
    const currentDate = new Date();

    const overdueBorrowedBooks = await this.borrowedBookModel.find({
      returnDate: { $lte: currentDate }, // Check if the returnDate is less than or equal to the current date
      overdue: false,
      returned: false, // Check if the book has not been returned
    });

    console.log('Overdue books:', overdueBorrowedBooks);

    for (const borrowedBook of overdueBorrowedBooks) {
      const overdueDate = new Date(borrowedBook.returnDate);

      const overdueMinutes = Math.floor(
        (currentDate.getTime() - overdueDate.getTime()) / (60 * 1000),
      );

      const originalFine = 2; // Original fine amount
      const fineAmount = Math.max(
        originalFine,
        originalFine + Math.floor(overdueMinutes / 5),
      );

      console.log(fineAmount);
      const overdueBook = new this.overdueBookModel({
        title: borrowedBook.title,
        author: borrowedBook.author,
        department: borrowedBook.department,
        overdueDate: overdueDate,
        book: borrowedBook.book,
        user: borrowedBook.user,
        bookid: borrowedBook.bookid,
        userid: borrowedBook.userid,
        username: borrowedBook.username,
      });

      const fineEntry = new this.fineModel({
        user: borrowedBook.username,
        book: borrowedBook.title,
        fineAmount: fineAmount,
      });

      await Promise.all([
        overdueBook.save(),
        borrowedBook.updateOne({ overdue: true }),
        fineEntry.save(),
      ]);

      // Send an email notification for overdue books with fine information
      const user = await this.userModel.findById(borrowedBook.user);
      if (user && user.email) {
        await sendEmail(
          user.email,
          'Book Overdue Notification with Fine',
          `The book "${borrowedBook.title}" is overdue. Please return it as soon as possible.\nFine: $${fineAmount}`,
        );
      }
    }
  }

  async queue(): Promise<Queue[]> {
    return this.queueModel.find().sort({ _id: -1 }).exec();
  }

  async getBorrowedBooks(filterDto: BorrowedBooksFilterDto): Promise<any[]> {
    let query = this.borrowedBookModel.find();

    if (filterDto) {
      if (filterDto.overdue !== undefined) {
        query = query.where('overdue').equals(filterDto.overdue === 'true');
      }

      if (filterDto.returned !== undefined) {
        query = query.where('returned').equals(filterDto.returned === 'true');
      }

      if (filterDto.returnDate) {
        query = query.where('returnDate').equals(filterDto.returnDate);
      }

      if (filterDto.borrowDate) {
        query = query.where('borrowDate').equals(filterDto.borrowDate);
      }
    }

    const borrowedBooks = await query.sort({ _id: -1 }).exec();

    // Manually convert Date objects to formatted strings in the response
    const formattedBorrowedBooks = borrowedBooks.map((book) => ({
      ...book.toJSON(),
      borrowDate: this.formatDateTime(book.borrowDate),
      returnDate: this.formatDateTime(book.returnDate),
    }));

    return formattedBorrowedBooks;
  }

  async getOverdueBooks(): Promise<OverdueBook[]> {
    return this.overdueBookModel.find().sort({ _id: -1 }).exec();
  }

  async createFine(fineData: {
    user: string;
    book: string;
    fineAmount: number;
  }): Promise<Fine> {
    const createdFine = new this.fineModel(fineData);
    return createdFine.save();
  }

  async getAllFines(): Promise<Fine[]> {
    return this.fineModel.find().exec();
  }

  async getFinesForUser(email: string): Promise<Fine[]> {
    try {
      // Find the user by email
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      // Find fines based on the user's username
      const fines = await this.fineModel
        .find({
          $or: [{ user: user.username }],
        })
        .exec();

      console.log(user);
      return fines;
    } catch (error) {
      // Handle errors appropriately
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new HttpException(error.message, 400);
      }
    }
  }

  async getTotalFineAmountForUser(email: string): Promise<number> {
    try {
      // Find the user by email
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      // Find fines based on the user's username
      const fines = await this.fineModel
        .find({
          $or: [{ user: user.username }],
        })
        .exec();

      // Calculate the total fine amount
      const totalFineAmount = fines.reduce(
        (total, fine) => total + fine.fineAmount,
        0,
      );

      return totalFineAmount;
    } catch (error) {
      // Handle errors appropriately
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new HttpException(error.message, 400);
      }
    }
  }
  async calculateTotalFineAmount(): Promise<number> {
    const fines = await this.fineModel.find().exec();
    return fines.reduce((total, fine) => total + fine.fineAmount, 0);
  }

  async totalBooks() {
    return this.bookModel.find().countDocuments().exec();
  }

  async getBooksByUserDepartment(userId: string): Promise<Book[]> {
    // Find the user based on the provided userId
    const user = await this.userModel.findById(userId);
    console.log(user);

    if (!user) {
      // Handle the case where the user is not found
      throw new NotFoundException('User not found');
    }

    // Retrieve the department of the user
    const userDepartment = user.department;
    console.log(userDepartment);

    // Find all books in the user's department
    const booksInDepartment = await this.bookModel
      .find({ department: userDepartment })
      .sort({ _id: -1 })
      .exec();

    return booksInDepartment;
  }

  async totalBorrowedBooks() {
    return this.borrowedBookModel.find().countDocuments().exec();
  }

  async getBorrowedBooksByUserId(userId: string): Promise<BorrowedBook[]> {
    return this.borrowedBookModel.find({ userId }).exec();
  }

  async totalOverdueBooks() {
    return this.overdueBookModel.find().countDocuments().exec();
  }

  async getBorrowedBookById(id: string): Promise<BorrowedBook> {
    const borrowedBook = await this.borrowedBookModel.findById(id).exec();

    if (!borrowedBook) {
      throw new NotFoundException(`Borrowed book with ID ${id} not found.`);
    }

    return borrowedBook;
  }

  async returnBook(borrowedBookId: string): Promise<ReturnedBook | string> {
    const borrowedBook = await this.borrowedBookModel
      .findOne({ borrowedBookid: borrowedBookId, returned: false })
      .exec();

    console.log(borrowedBookId);
    if (!borrowedBook) {
      throw new NotFoundException(
        `Borrowed book with borrowedBookId ${borrowedBookId} not found or already returned`,
      );
    }

    const session = await this.borrowedBookModel.startSession();
    session.startTransaction();

    try {
      const options = { session };

      await this.borrowedBookModel.findOneAndUpdate(
        { borrowedBookid: borrowedBookId, returned: false },
        { returned: true },
        options,
      );

      const book = await this.bookModel.findById(borrowedBook.book).exec();
      if (book) {
        book.total++;
        book.available = true;
        await book.save(options);
      }

      const returnedBook = new this.returnedBookModel({
        title: borrowedBook.title,
        author: borrowedBook.author,
        department: borrowedBook.department,
        total: borrowedBook.total,
        borrowDate: borrowedBook.borrowDate,
        returnDate: borrowedBook.returnDate,
        bookid: borrowedBook.bookid,
        userid: borrowedBook.userid,
        returned: true,
      });

      await returnedBook.save(options);

      await session.commitTransaction();
      session.endSession();

      return returnedBook;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async generateAllBooksExcel(): Promise<ExcelJS.Workbook> {
    const books = await this.getBooks();
    return this.generateExcelFile(books, [
      'bookid',
      'title',
      'imageurl',
      'department',
      'total',
      'author',
    ]);
  }

  async generateAllBorrowedBooksExcel(): Promise<ExcelJS.Workbook> {
    const borrowedBooks = await this.getBorrowedBooksxcel();
    return this.generateExcelFile(borrowedBooks, [
      'title',
      'author',
      'department',
      'returned',
      'overdue',
      'username',
    ]);
  }

  private async getBooks() {
    const fetchedBooks = await this.getAllBooks();

    // Map the fetched books to include only the specified fields
    return fetchedBooks.map((book) => ({
      bookid: book.bookid,
      title: book.title,
      imageurl: book.imageUrl,
      department: book.department,
      total: book.total,
      author: book.author,
    }));
  }

  async getAllBorrowedBooks(): Promise<any[]> {
    const borrowedBooks = await this.borrowedBookModel
      .find()
      .sort({ _id: -1 })
      .exec();

    // Manually convert Date objects to formatted strings in the response
    const formattedBorrowedBooks = borrowedBooks.map((book) => ({
      ...book.toJSON(),
      borrowDate: this.formatDateTime(book.borrowDate),
      returnDate: this.formatDateTime(book.returnDate),
    }));

    return formattedBorrowedBooks;
  }

  private async getBorrowedBooksxcel() {
    const fetchedBooks = await this.getAllBorrowedBooks();

    // Map the fetched books to include only the specified fields
    return fetchedBooks.map((book) => ({
      title: book.title,
      author: book.author,
      department: book.department,
      returned: book.returned,
      overdue: book.overdue,
      username: book.username,
    }));
  }

  private generateExcelFile(data: any[], fields: string[]): ExcelJS.Workbook {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Add headers based on the specified fields
    worksheet.addRow(
      fields.map((field) => field.charAt(0).toUpperCase() + field.slice(1)),
    );

    // Add data
    data.forEach((item) => {
      const row = fields.map((field) => item[field]);
      worksheet.addRow(row);
    });

    return workbook;
  }

  async deleteBook(bookId: string): Promise<void> {
    try {
      // Delete the book by custom identifier
      const result = await this.bookModel.deleteOne({ bookid: bookId }).exec();

      if (result.deletedCount === 0) {
        throw new NotFoundException(`Book with bookId ${bookId} not found`);
      }
    } catch (error) {
      throw error;
    }
  }
}
