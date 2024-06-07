import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OverdueBookDocument = OverdueBook & Document;

@Schema()
export class OverdueBook {
  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  author: string;

  @Prop({ required: false })
  department: string;

  @Prop({ required: false })
  overdueDate: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Book' })
  book: MongooseSchema.Types.ObjectId; // Reference to the original book

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: MongooseSchema.Types.ObjectId; // Reference to the original book

  @Prop({ required: false })
  userid: string;

  @Prop({ required: false })
  bookid: string;

  @Prop({ required: false })
  username: string;


}

export const OverdueBookSchema = SchemaFactory.createForClass(OverdueBook);
