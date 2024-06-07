import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReturnedBookDocument = ReturnedBook & Document;

@Schema()
export class ReturnedBook {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  department: string;
  
  @Prop({ required: true })
  returned: boolean; // Indicates whether the book has been returned

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  returnDate: Date;

  @Prop({ required: true })
  userid: string;

  @Prop({ required: true })
  bookid: string;


}

export const ReturnedBookSchema = SchemaFactory.createForClass(ReturnedBook);
