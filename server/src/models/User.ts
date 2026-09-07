import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  name?: string;
  currency: 'USD' | 'INR';
  securityQuestion?: string;
  securityAnswerHash?: string;
  hasConfiguredSecurity?: boolean;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  currency: {
    type: String,
    enum: ['USD', 'INR'],
    default: 'INR',
  },
  securityQuestion: {
    type: String,
  },
  securityAnswerHash: {
    type: String,
  },
  hasConfiguredSecurity: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: false,
  collection: 'users',
});

export const User = model<IUser>('User', userSchema);

