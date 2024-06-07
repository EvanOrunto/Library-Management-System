import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Query,
  NotFoundException,
  Body,
  UseGuards,
  Req,
  Res,
  ValidationPipe,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { BooksService } from './library.service';
import { CreateBookDto } from './dto/create-book.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchBooksDto } from './dto/book-search.dto';
import { BorrowedBook } from './schema/borrowedbook.schema';
import { AuthGuard } from '@nestjs/passport';
import { Queue } from './schema/queue.schema';
import { OverdueBook } from './schema/overdue-book.schema';
import { Response } from 'express';
import { Fine } from './schema/fine.schema';
import { BorrowedBooksFilterDto } from './dto/borrowedbookfiler.dto';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('createbook')
  createBook(@Body() createBookDto: CreateBookDto) {
    return this.booksService.createBook(createBookDto);
  }

  @Put('updatebook/:id')
  updateBook(@Param('id') id: string, @Body() updateBookDto: CreateBookDto) {
    const updatedBook = this.booksService.updateBook(id, updateBookDto);
    if (updatedBook) {
      return updatedBook;
    } else {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
  }

  @Get('gettotalbookvalue/books')
  async getTotalBooks() {
    return this.booksService.totalBooks();
  }

  @Get('gettotalborrowedbookvalue/books')
  async getTotalBorrowedBooks() {
    return this.booksService.totalBorrowedBooks();
  }

  @Get('gettotaloverduebookvalue/books')
  async getTotalUsers() {
    return this.booksService.totalOverdueBooks();
  }

  @Get('getallbooks')
  getAllBooks() {
    return this.booksService.getAllBooks();
  }

  @Get('getbook/:id')
  getBookById(@Param('id') id: string) {
    return this.booksService.getBookById(id);
  }

  @Get('searchbooks')
  searchBooks(@Query() query: SearchBooksDto) {
    return this.booksService.searchBooksByCriteria(query);
  }

  @ApiBearerAuth()
  @Post('borrowbooks/:id')
  @UseGuards(AuthGuard('jwt'))
  async borrowBook(@Param('id') bookId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.booksService.borrowBook(userId, bookId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt')) // Use a JWT guard to ensure the user is authenticated
  @Get('userbooks-in-department')
  async getBooksInUserDepartment(@Req() req: any) {
    // Retrieve the user ID from the JWT payload
    const userId = req.user.userId;

    // Call the service method to get books in the user's department
    const books = await this.booksService.getBooksByUserDepartment(userId);

    return books;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt')) // Use a JWT guard to ensure the user is authenticated
  @Get('borrowed-books')
  async getBorrowedBooksByUser(@Req() req: any): Promise<BorrowedBook[]> {
    const userId = req.user.id; // Get the user's ID from the request, adjust this based on your authentication setup
    const borrowedBooks = await this.booksService.getBorrowedBooksByUserId(
      userId,
    );
    return borrowedBooks;
  }

  @Post('return/:borrowedBookId')
  async returnBook(@Param('borrowedBookId') borrowedBookId: string) {
    try {
      const returnedBook = await this.booksService.returnBook(borrowedBookId);
      return { message: 'Book returned successfully', returnedBook };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw error;
      }
    }
  }
  @Get('getborrowedbooks')
  async getBorrowedBooks(
    @Query(ValidationPipe) filterDto: BorrowedBooksFilterDto,
  ): Promise<any[]> {
    return this.booksService.getBorrowedBooks(filterDto);
  }
  @Get('getoverduebooks')
  async getoverduebooks(): Promise<OverdueBook[]> {
    return this.booksService.getOverdueBooks();
  }

  @Get('getqueuedusers')
  async getQueue(): Promise<Queue[]> {
    return this.booksService.queue();
  }

  @Get('getborrowedbooks/:id')
  async getBorrowedBookById(@Param('id') id: string) {
    try {
      const borrowedBook = await this.booksService.getBorrowedBookById(id);
      return borrowedBook;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Borrowed book with ID ${id} not found.`);
      }
      throw error;
    }
  }

  @Post('/createfine')
  async createFine(
    @Body() createFineDto: { user: string; book: string; fineAmount: number },
  ) {
    try {
      const createdFine = await this.booksService.createFine(createFineDto);
      return { message: 'Fine created successfully', fine: createdFine };
    } catch (error) {
      return { error: 'Error creating fine', details: error.message || error };
    }
  }

  @Get('/allfines')
  async getAllFines() {
    try {
      const allFines = await this.booksService.getAllFines();
      return { fines: allFines };
    } catch (error) {
      return { error: 'Error fetching fines', details: error.message || error };
    }
  }

  @Get('fines/:usernameOrEmail')
  async getFinesForUser(
    @Param('usernameOrEmail') email: string,
  ): Promise<Fine[]> {
    console.log(email);
    try {
      const fines = await this.booksService.getFinesForUser(email);
      return fines;
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Handle not found error
        throw new NotFoundException(error.message);
      } else {
        // Handle other errors
        throw new HttpException(error.message, 400);
      }
    }
  }

  @Get('/totalfines')
  async getTotalFineAmount() {
    try {
      const totalAmount = await this.booksService.calculateTotalFineAmount();
      return { totalFineAmount: totalAmount };
    } catch (error) {
      return {
        error: 'Error calculating total fine amount',
        details: error.message || error,
      };
    }
  }

  @Get('all-books-report')
  async getAllBooksExcel(@Res() res: Response): Promise<void> {
    const workbook = await this.booksService.generateAllBooksExcel();

    // Set headers for file download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=all_books.xlsx');

    // Write the workbook directly to the response
    await workbook.xlsx.write(res);

    // End the response
    res.end();
  }

  @Get('all-borrowed-books-report')
  async getAllBorrowedBooksExcel(@Res() res: Response): Promise<void> {
    const workbook = await this.booksService.generateAllBorrowedBooksExcel();

    // Set headers for file download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=all_borrowed_books.xlsx',
    );

    // Write the workbook directly to the response
    await workbook.xlsx.write(res);

    // End the response
    res.end();
  }

  @Delete(':bookId')
  async deleteBook(@Param('bookId') bookId: string): Promise<void> {
    try {
      await this.booksService.deleteBook(bookId);
    } catch (error) {
      // Handle errors appropriately, you might want to return an HTTP response with an error status
      console.error(error);
      // For example:
      throw new InternalServerErrorException('Failed to delete the book.');
    }
  }
  @Get('totalAmount/:email')
  async getTotalFineAmountForUser(
    @Param('email') email: string,
  ): Promise<number> {
    try {
      const totalFineAmount = await this.booksService.getTotalFineAmountForUser(
        email,
      );
      return totalFineAmount;
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Handle not found error
        throw new NotFoundException(error.message);
      } else {
        // Handle other errors
        throw new NotFoundException('Failed to get total fine amount.');
      }
    }
  }
}
