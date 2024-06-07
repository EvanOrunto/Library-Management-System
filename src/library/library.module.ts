import { Module } from '@nestjs/common';
import { BooksController } from './library.controller';
import { BooksService } from './library.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './schema/book.schema';
import { BorrowedBook, BorrowedBookSchema } from './schema/borrowedbook.schema';
import { ReturnedBook, ReturnedBookSchema } from './schema/return-book.schema';
import { UserService } from '../user/user.service';
import { User, UserSchema } from '../user/schema/user.schema';
import { Queue, QueueSchema } from './schema/queue.schema';
import { OverdueBook, OverdueBookSchema } from './schema/overdue-book.schema';
import { Fine, FineSchema } from './schema/fine.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: BorrowedBook.name, schema: BorrowedBookSchema },
    ]),
    MongooseModule.forFeature([
      { name: ReturnedBook.name, schema: ReturnedBookSchema },
    ]),
    MongooseModule.forFeature([
      { name: OverdueBook.name, schema: OverdueBookSchema },
    ]),
    MongooseModule.forFeature([{ name: Queue.name, schema: QueueSchema }]),
    MongooseModule.forFeature([{ name: Fine.name, schema: FineSchema }]),
  ],
  controllers: [BooksController],
  providers: [BooksService, UserService],
})
export class LibraryModule {}
