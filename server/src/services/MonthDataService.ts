import {
  MonthData,
  IIncomeItem,
  IIncomeEntry,
  IExpenseItem,
  IExpenseEntry,
} from "../models";
import { generateId } from "../utils/idGenerator";
import { recalculateMonthTotals } from "../utils/monthCalculations";
import { logger } from "../config/logger";
import { recurringExpenseService } from "./RecurringExpenseService";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export class MonthDataService {
  /**
   * Get all months for a user, sorted by year and month descending
   */
  async getAllMonths(userId: string) {
    const userMonths = await MonthData.find({ userId }).sort({
      year: -1,
      month: -1,
    });

    return userMonths;
  }

  /**
   * Get a specific month by ID
   */
  async getMonthById(monthId: string) {
    const month = await MonthData.findById(monthId);

    if (!month) {
      throw new Error("MONTH_NOT_FOUND");
    }

    return month;
  }

  /**
   * Create a new month with automatic carry forward from previous month
   */
  async createMonth(userId: string, year: number, month: number) {
    // Check if month already exists
    const existingMonth = await MonthData.findOne({ userId, year, month });
    if (existingMonth) {
      throw new Error("MONTH_EXISTS");
    }

    // Calculate previous month
    let prevMonth = month - 1;
    let prevYear = year;

    if (prevMonth < 0) {
      prevMonth = 11; // December
      prevYear = year - 1;
    }

    // Get carry forward from previous month
    let carryForwardAmount = 0;
    const previousMonth = await MonthData.findOne({
      userId,
      year: prevYear,
      month: prevMonth,
    });

    if (previousMonth && previousMonth.carryForward > 0) {
      carryForwardAmount = previousMonth.carryForward;
    }

    // Create income array with carry forward if applicable
    const income: IIncomeItem[] = [];
    if (carryForwardAmount > 0) {
      income.push({
        id: generateId("inc"),
        category: "Carry Forward",
        amount: carryForwardAmount,
        comment: `${carryForwardAmount}(From ${MONTH_NAMES[prevMonth]} ${prevYear})`,
        entries: [
          {
            id: generateId("entry"),
            amount: carryForwardAmount,
            note: `From ${MONTH_NAMES[prevMonth]} ${prevYear}`,
          },
        ],
      });
    }

    // Fetch recurring expenses and add them to the new month
    const recurringExpenses = await recurringExpenseService.getRecurringExpenses(userId);
    const expenses: IExpenseItem[] = [];

    for (const recurring of recurringExpenses) {
      const expenseEntry: IExpenseEntry = {
        id: generateId("entry"),
        amount: recurring.amount,
        note: recurring.note || "",
        tag: recurring.tag || "neutral",
      };

      const expenseItem: IExpenseItem = {
        id: generateId("exp"),
        category: recurring.category,
        amount: recurring.amount,
        comment: `${recurring.amount}(${recurring.note || "Recurring expense"})`,
        entries: [expenseEntry],
      };

      expenses.push(expenseItem);
    }

    // Create new month
    const newMonth = await MonthData.create({
      userId,
      monthName: `${MONTH_NAMES[month]} ${year}`,
      year,
      month,
      income,
      expenses,
      totalIncome: 0, // Will be recalculated
      totalExpense: 0, // Will be recalculated
      carryForward: 0, // Will be recalculated
    });

    // Recalculate totals to ensure accuracy
    recalculateMonthTotals(newMonth);
    await newMonth.save();

    logger.info(
      `New month created: ${newMonth.monthName} for user ${userId} with ${recurringExpenses.length} recurring expenses`
    );

    return newMonth;
  }

  /**
   * Add income entry to a month
   */
  async addIncomeEntry(
    monthId: string,
    category: string,
    amount: number,
    note: string
  ) {
    const month = await MonthData.findById(monthId);
    if (!month) {
      throw new Error("MONTH_NOT_FOUND");
    }

    // Initialize income array if undefined
    if (!month.income) {
      month.income = [];
    }

    // Find existing income category
    const incomeIndex = month.income.findIndex((i) => i.category === category);

    const newEntry: IIncomeEntry = {
      id: generateId("entry"),
      amount: Number(amount),
      note: note || "",
    };

    if (incomeIndex !== -1) {
      // Category exists - add entry to it
      const income = month.income[incomeIndex];
      if (!income.entries) {
        income.entries = [];
      }

      income.entries.push(newEntry);

      // Recalculate total for this category
      income.amount = income.entries.reduce(
        (sum, entry) => sum + entry.amount,
        0
      );

      // Update the breakdown comment
      income.comment = income.entries
        .map((e) => `${e.amount}(${e.note || "No note"})`)
        .join("+");
    } else {
      // New category - create income with entry
      const newIncome: IIncomeItem = {
        id: generateId("inc"),
        category,
        amount: Number(amount),
        comment: `${amount}(${note || "No note"})`,
        entries: [newEntry],
      };
      month.income.push(newIncome);
    }

    recalculateMonthTotals(month);
    month.markModified("income");
    await month.save();

    logger.info(
      `Income entry added: ${category} - ${amount} to month ${month.monthName}`
    );

    return month;
  }

  /**
   * Update income entry
   */
  async updateIncomeEntry(
    entryId: string,
    monthId: string,
    amount: number,
    note: string
  ) {
    const month = await MonthData.findById(monthId);
    if (!month) {
      throw new Error("MONTH_NOT_FOUND");
    }

    // Find the income item containing this entry
    let found = false;
    for (const income of month.income) {
      if (income.entries) {
        const entryIndex = income.entries.findIndex((e) => e.id === entryId);
        if (entryIndex !== -1) {
          // Update the entry
          income.entries[entryIndex] = {
            ...income.entries[entryIndex],
            amount: Number(amount),
            note: note || "",
          };

          // Recalculate category total
          income.amount = income.entries.reduce(
            (sum, entry) => sum + entry.amount,
            0
          );

          // Update breakdown comment
          income.comment = income.entries
            .map((e) => `${e.amount}(${e.note || "No note"})`)
            .join("+");

          found = true;
          break;
        }
      }
    }

    if (!found) {
      throw new Error("ENTRY_NOT_FOUND");
    }

    recalculateMonthTotals(month);
    month.markModified("income");
    await month.save();

    logger.info(`Income entry updated: ${entryId} in month ${month.monthName}`);

    return month;
  }

  /**
   * Delete income entry
   */
  async deleteIncomeEntry(entryId: string, monthId: string) {
    const month = await MonthData.findById(monthId);
    if (!month) {
      throw new Error("MONTH_NOT_FOUND");
    }

    let found = false;
    for (const income of month.income) {
      if (income.entries) {
        const entryIndex = income.entries.findIndex((e) => e.id === entryId);
        if (entryIndex !== -1) {
          income.entries.splice(entryIndex, 1);

          // If no more entries, remove the category
          if (income.entries.length === 0) {
            month.income = month.income.filter((i) => i.id !== income.id);
          } else {
            // Recalculate category total
            income.amount = income.entries.reduce(
              (sum, entry) => sum + entry.amount,
              0
            );
            income.comment = income.entries
              .map((e) => `${e.amount}(${e.note || "No note"})`)
              .join("+");
          }

          found = true;
          break;
        }
      }
    }

    if (!found) {
      throw new Error("ENTRY_NOT_FOUND");
    }

    recalculateMonthTotals(month);
    month.markModified("income");
    await month.save();

    logger.info(`Income entry deleted: ${entryId} from month ${month.monthName}`);

    return month;
  }

  /**
   * Delete entire income category
   */
  async deleteIncomeCategory(incomeId: string, monthId: string) {
    const month = await MonthData.findById(monthId);
    if (!month) {
      throw new Error("MONTH_NOT_FOUND");
    }

    month.income = month.income.filter((i) => i.id !== incomeId);
    recalculateMonthTotals(month);
    month.markModified("income");
    await month.save();

    logger.info(`Income category deleted: ${incomeId} from month ${month.monthName}`);

    return month;
  }

  /**
   * Add expense entry to a month
   */
  async addExpenseEntry(
    monthId: string,
    category: string,
    amount: number,
    note: string,
    tag: "need" | "want" | "neutral"
  ) {
    const month = await MonthData.findById(monthId);
    if (!month) {
      throw new Error("MONTH_NOT_FOUND");
    }

    // Initialize expenses array if undefined
    if (!month.expenses) {
      month.expenses = [];
    }

    // Find existing expense for this category
    const expenseIndex = month.expenses.findIndex(
      (e) => e.category === category
    );

    const newEntry: IExpenseEntry = {
      id: generateId("entry"),
      amount: Number(amount),
      note: note || "",
      tag: tag || "neutral",
    };

    if (expenseIndex !== -1) {
      // Category exists - add entry to it
      const expense = month.expenses[expenseIndex];
      if (!expense.entries) {
        expense.entries = [];
      }

      expense.entries.push(newEntry);

      // Recalculate total for this category
      expense.amount = expense.entries.reduce(
        (sum, entry) => sum + entry.amount,
        0
      );

      // Update the breakdown comment
      expense.comment = expense.entries
        .map((e) => `${e.amount}(${e.note || "No note"})`)
        .join("+");
    } else {
      // New category - create expense with entry
      const newExpense: IExpenseItem = {
        id: generateId("exp"),
        category,
        amount: Number(amount),
        comment: `${amount}(${note || "No note"})`,
        entries: [newEntry],
      };
      month.expenses.push(newExpense);
    }

    recalculateMonthTotals(month);
    month.markModified("expenses");
    await month.save();

    logger.info(
      `Expense entry added: ${category} - ${amount} to month ${month.monthName}`
    );

    return month;
  }

  /**
   * Update expense entry
   */
  async updateExpenseEntry(
    entryId: string,
    monthId: string,
    amount: number,
    note: string,
    tag: "need" | "want" | "neutral"
  ) {
    const month = await MonthData.findById(monthId);
    if (!month) {
      throw new Error("MONTH_NOT_FOUND");
    }

    let found = false;
    for (const expense of month.expenses) {
      if (expense.entries) {
        const entryIndex = expense.entries.findIndex((e) => e.id === entryId);
        if (entryIndex !== -1) {
          expense.entries[entryIndex] = {
            ...expense.entries[entryIndex],
            amount: Number(amount),
            note: note || "",
            tag: tag || "neutral",
          };

          // Recalculate category total
          expense.amount = expense.entries.reduce(
            (sum, entry) => sum + entry.amount,
            0
          );

          // Update breakdown comment
          expense.comment = expense.entries
            .map((e) => `${e.amount}(${e.note || "No note"})`)
            .join("+");

          found = true;
          break;
        }
      }
    }

    if (!found) {
      throw new Error("ENTRY_NOT_FOUND");
    }

    recalculateMonthTotals(month);
    month.markModified("expenses");
    await month.save();

    logger.info(`Expense entry updated: ${entryId} in month ${month.monthName}`);

    return month;
  }

  /**
   * Delete expense entry
   */
  async deleteExpenseEntry(entryId: string, monthId: string) {
    const month = await MonthData.findById(monthId);
    if (!month) {
      throw new Error("MONTH_NOT_FOUND");
    }

    let found = false;
    for (const expense of month.expenses) {
      if (expense.entries) {
        const entryIndex = expense.entries.findIndex((e) => e.id === entryId);
        if (entryIndex !== -1) {
          expense.entries.splice(entryIndex, 1);

          // If no more entries, remove the category
          if (expense.entries.length === 0) {
            month.expenses = month.expenses.filter((e) => e.id !== expense.id);
          } else {
            // Recalculate category total
            expense.amount = expense.entries.reduce(
              (sum, entry) => sum + entry.amount,
              0
            );
            expense.comment = expense.entries
              .map((e) => `${e.amount}(${e.note || "No note"})`)
              .join("+");
          }

          found = true;
          break;
        }
      }
    }

    if (!found) {
      throw new Error("ENTRY_NOT_FOUND");
    }

    recalculateMonthTotals(month);
    month.markModified("expenses");
    await month.save();

    logger.info(`Expense entry deleted: ${entryId} from month ${month.monthName}`);

    return month;
  }

  /**
   * Delete entire expense category
   */
  async deleteExpenseCategory(expenseId: string, monthId: string) {
    const month = await MonthData.findById(monthId);
    if (!month) {
      throw new Error("MONTH_NOT_FOUND");
    }

    month.expenses = month.expenses.filter((e) => e.id !== expenseId);
    recalculateMonthTotals(month);
    month.markModified("expenses");
    await month.save();

    logger.info(`Expense category deleted: ${expenseId} from month ${month.monthName}`);

    return month;
  }

  /**
   * Delete entire month
   */
  async deleteMonth(monthId: string, userId: string) {
    // Check if user is admin
    const { User } = await import("../models");
    const user = await User.findById(userId);
    
    if (user && user.username.toLowerCase() === "admin") {
      throw new Error("ADMIN_DELETION_BLOCKED");
    }

    const month = await MonthData.findOne({ _id: monthId, userId });
    if (!month) {
      throw new Error("MONTH_NOT_FOUND");
    }

    const monthName = month.monthName;

    // Delete the month
    await MonthData.deleteOne({ _id: monthId });

    logger.info(`Month deleted: ${monthId} (${monthName}) by user ${userId}`);

    return { success: true, monthName };
  }
}

// Export singleton instance
export const monthDataService = new MonthDataService();

