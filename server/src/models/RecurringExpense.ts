import { Schema, model, Document } from 'mongoose';

export interface IRecurringExpense extends Document {
  userId: string;
  category: string;
  amount: number;
  note: string;
  tag: 'need' | 'want' | 'neutral';
  createdAt: Date;
}

const recurringExpenseSchema = new Schema<IRecurringExpense>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  tag: {
    type: String,
    enum: ['need', 'want', 'neutral'],
    default: 'neutral',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
  collection: 'recurring_expenses',
});

export const RecurringExpense = model<IRecurringExpense>('RecurringExpense', recurringExpenseSchema);

