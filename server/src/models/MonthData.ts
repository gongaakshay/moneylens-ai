import { Schema, model, Document } from 'mongoose';

export interface IIncomeEntry {
  id: string;
  amount: number;
  note: string;
}

export interface IIncomeItem {
  id: string;
  category: string;
  amount: number;
  comment: string;
  entries?: IIncomeEntry[];
}

export interface IExpenseEntry {
  id: string;
  amount: number;
  note: string;
  tag?: 'need' | 'want' | 'neutral';
}

export interface IExpenseItem {
  id: string;
  category: string;
  amount: number;
  comment: string;
  entries?: IExpenseEntry[];
}

export interface IMonthData extends Document {
  userId: string;
  monthName: string;
  year: number;
  month: number;
  income: IIncomeItem[];
  expenses: IExpenseItem[];
  totalIncome: number;
  totalExpense: number;
  carryForward: number;
}

const monthDataSchema = new Schema<IMonthData>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  monthName: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  income: [Schema.Types.Mixed],
  expenses: [Schema.Types.Mixed],
  totalIncome: {
    type: Number,
    default: 0,
  },
  totalExpense: {
    type: Number,
    default: 0,
  },
  carryForward: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: false,
  collection: 'months',
});

// Compound unique index
monthDataSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

export const MonthData = model<IMonthData>('MonthData', monthDataSchema);

