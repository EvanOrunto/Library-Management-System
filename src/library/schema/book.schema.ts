import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookDocument = Book & Document;

@Schema()
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  bookid: string;

  @Prop({ required: false })
  imageUrl: string

  @Prop({ required: true })
  available: boolean;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  total: number;


}

export const BookSchema = SchemaFactory.createForClass(Book);
