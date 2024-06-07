import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BorrowedBookDocument = BorrowedBook & Document;

@Schema()
export class BorrowedBook {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  borrowDate: Date;

  @Prop({ required: true })
  returnDate: Date;

  @Prop({ required: true })
  borrowedBookid: string;

  @Prop({ required: false })
  returned: boolean; // Indicates whether the book has been returned

  @Prop({ required: false })
  overdue: boolean; // Indicates whether the book has been returned

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Book' })
  book: MongooseSchema.Types.ObjectId; // Reference to the original book

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: MongooseSchema.Types.ObjectId; // Reference to the original book

  @Prop({ required: true })
  userid: string;

  @Prop({ required: true })
  bookid: string;

  @Prop({ required: true })
  username: string;
}

export const BorrowedBookSchema = SchemaFactory.createForClass(BorrowedBook);
