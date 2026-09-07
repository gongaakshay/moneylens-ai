import ExcelJS from "exceljs";
import { MonthData } from "@/types";

// Month abbreviations for sheet names
const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Color constants
const COLORS = {
  INCOME_HEADER: "6B46C1", // Purple
  EXPENSE_HEADER: "DC2626", // Red
  WHITE: "FFFFFF",
  BLACK: "000000",
};

/**
 * Format currency amount based on currency type
 */
function formatCurrency(amount: number, currency: "USD" | "INR" = "INR"): string {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol} ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Apply border to a cell
 */
function applyBorder(cell: ExcelJS.Cell) {
  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
}

/**
 * Create a styled header row
 */
function createHeaderRow(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  title: string,
  bgColor: string
) {
  const row = worksheet.getRow(rowNumber);
  const cell = row.getCell(1);
  cell.value = title;
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: bgColor },
  };
  cell.font = {
    bold: true,
    color: { argb: COLORS.WHITE },
    size: 12,
  };
  cell.alignment = { vertical: "middle", horizontal: "left" };
  applyBorder(cell);

  // Merge cells for header
  worksheet.mergeCells(rowNumber, 1, rowNumber, 3);
}

/**
 * Add column headers (Description, Amount, Comment)
 */
function addColumnHeaders(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  bgColor: string
) {
  const row = worksheet.getRow(rowNumber);
  const headers = ["Description", "Amount", "Comment"];

  headers.forEach((header, index) => {
    const cell = row.getCell(index + 1);
    cell.value = header;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: bgColor },
    };
    cell.font = {
      bold: true,
      color: { argb: COLORS.WHITE },
      size: 11,
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    applyBorder(cell);
  });
}

/**
 * Add a data row (income or expense item)
 */
function addDataRow(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  description: string,
  amount: number,
  comment: string
) {
  const row = worksheet.getRow(rowNumber);

  // Description
  const descCell = row.getCell(1);
  descCell.value = description;
  descCell.alignment = { vertical: "middle", horizontal: "left" };
  applyBorder(descCell);

  // Amount
  const amountCell = row.getCell(2);
  amountCell.value = amount;
  amountCell.numFmt = "#,##0.00";
  amountCell.alignment = { vertical: "middle", horizontal: "right" };
  applyBorder(amountCell);

  // Comment
  const commentCell = row.getCell(3);
  commentCell.value = comment;
  commentCell.alignment = { vertical: "middle", horizontal: "left" };
  applyBorder(commentCell);
}

/**
 * Add a total row
 */
function addTotalRow(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  label: string,
  total: number,
  currency: "USD" | "INR" = "INR"
) {
  const row = worksheet.getRow(rowNumber);

  // Label
  const labelCell = row.getCell(1);
  labelCell.value = label;
  labelCell.font = { bold: true };
  labelCell.alignment = { vertical: "middle", horizontal: "left" };
  applyBorder(labelCell);

  // Total with currency
  const totalCell = row.getCell(2);
  totalCell.value = formatCurrency(total, currency);
  totalCell.font = { bold: true };
  totalCell.alignment = { vertical: "middle", horizontal: "right" };
  applyBorder(totalCell);

  // Empty cell for comment column
  const emptyCell = row.getCell(3);
  applyBorder(emptyCell);
}

/**
 * Populate a worksheet with month data
 */
function populateMonthSheet(
  worksheet: ExcelJS.Worksheet,
  monthData: MonthData,
  currency: "USD" | "INR" = "INR"
) {
  let currentRow = 1;

  // Set column widths
  worksheet.getColumn(1).width = 25; // Description
  worksheet.getColumn(2).width = 20; // Amount
  worksheet.getColumn(3).width = 60; // Comment

  // Month header (e.g., "Jan-25")
  const monthYear = `${MONTH_ABBR[monthData.month]}-${monthData.year.toString().slice(-2)}`;
  const titleRow = worksheet.getRow(currentRow);
  const titleCell = titleRow.getCell(1);
  titleCell.value = monthYear;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.mergeCells(currentRow, 1, currentRow, 3);
  currentRow += 2;

  // INCOME SECTION
  createHeaderRow(worksheet, currentRow, "INCOME", COLORS.INCOME_HEADER);
  currentRow++;

  // Income column headers
  addColumnHeaders(worksheet, currentRow, COLORS.INCOME_HEADER);
  currentRow++;

  // Income items
  monthData.income.forEach((item) => {
    addDataRow(worksheet, currentRow, item.category, item.amount, item.comment);
    currentRow++;
  });

  // Income total
  addTotalRow(worksheet, currentRow, "Total", monthData.totalIncome, currency);
  currentRow += 2;

  // EXPENSE SECTION
  createHeaderRow(worksheet, currentRow, "EXPENSE", COLORS.EXPENSE_HEADER);
  currentRow++;

  // Expense column headers
  addColumnHeaders(worksheet, currentRow, COLORS.EXPENSE_HEADER);
  currentRow++;

  // Expense items
  monthData.expenses.forEach((item) => {
    addDataRow(worksheet, currentRow, item.category, item.amount, item.comment);
    currentRow++;
  });

  // Expense total
  addTotalRow(worksheet, currentRow, "Total", monthData.totalExpense, currency);
  currentRow += 2;

  // CARRY FORWARD
  const cfRow = worksheet.getRow(currentRow);
  const cfLabelCell = cfRow.getCell(1);
  cfLabelCell.value = "Carry Forward";
  cfLabelCell.font = { bold: true };
  cfLabelCell.alignment = { vertical: "middle", horizontal: "left" };
  applyBorder(cfLabelCell);

  const cfAmountCell = cfRow.getCell(2);
  cfAmountCell.value = formatCurrency(monthData.carryForward, currency);
  cfAmountCell.font = { bold: true };
  cfAmountCell.alignment = { vertical: "middle", horizontal: "right" };
  applyBorder(cfAmountCell);

  const cfEmptyCell = cfRow.getCell(3);
  applyBorder(cfEmptyCell);
}

/**
 * Export a single month to Excel
 */
export async function exportMonthToExcel(
  monthData: MonthData,
  currency: "USD" | "INR" = "INR"
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MoneyLens.ai";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(monthData.monthName);
  populateMonthSheet(worksheet, monthData, currency);

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Download file
  const monthAbbr = monthData.monthName.slice(0, 3);
  const filename = `${monthAbbr}_${monthData.year}.xlsx`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);

  return filename;
}

/**
 * Export multiple months (full year) to Excel with multiple sheets
 */
export async function exportYearToExcel(
  monthsData: MonthData[],
  year: number,
  currency: "USD" | "INR" = "INR"
) {
  if (monthsData.length === 0) {
    throw new Error("No data to export");
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MoneyLens.ai";
  workbook.created = new Date();

  // Sort months chronologically
  const sortedMonths = [...monthsData].sort((a, b) => a.month - b.month);

  // Create a sheet for each month
  sortedMonths.forEach((monthData) => {
    const sheetName = `${MONTH_ABBR[monthData.month]} ${monthData.year}`;
    const worksheet = workbook.addWorksheet(sheetName);
    populateMonthSheet(worksheet, monthData, currency);
  });

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Download file
  const filename = `Financial_Data_${year}.xlsx`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);

  return filename;
}

