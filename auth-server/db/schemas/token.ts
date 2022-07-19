import { Schema, Types, model } from 'mongoose';

interface IToken {
  _id: Types.ObjectId;
  type: 'access' | 'refresh';
  token: string;
}

export const tokenSchema = new Schema<IToken>({
  type: { type: String, required: true },
  token: { type: String, required: true },
});

export const Token = model<IToken>('Token', tokenSchema);
