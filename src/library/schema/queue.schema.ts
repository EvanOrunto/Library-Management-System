import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type QueueDocument = Queue & Document;

@Schema()
export class Queue {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  book: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  user: string;
}

export const QueueSchema = SchemaFactory.createForClass(Queue);
