// fines/fine.model.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Fine extends Document {
  @Prop({ required: true })
  user: string;

  @Prop({ required: true })
  book: string;

  @Prop({ required: true })
  fineAmount: number;
}

export const FineSchema = SchemaFactory.createForClass(Fine);
