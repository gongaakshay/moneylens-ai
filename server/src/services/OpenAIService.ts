import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../config/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

export interface MonthData {
  _id: string;
  monthName: string;
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  carryForward: number;
  income: Array<{
    category: string;
    amount: number;
    entries?: Array<{ amount: number; note: string }>;
  }>;
  expenses: Array<{
    category: string;
    amount: number;
    entries?: Array<{ amount: number; note: string; tag?: string }>;
  }>;
}

export interface OverviewInsights {
  financialHealthScore: number;
  summary: string;
  insights: Array<{
    id: string;
    title: string;
    description: string;
    category: "spending" | "budget" | "savings" | "prediction" | "health";
    severity?: "info" | "warning" | "success" | "critical";
    actionable?: boolean;
  }>;
  predictions: string[];
  generatedAt: string;
}

export interface MonthlyInsights {
  monthSummary: string;
  insights: Array<{
    id: string;
    title: string;
    description: string;
    category: "spending" | "budget" | "savings" | "prediction" | "health";
    severity?: "info" | "warning" | "success" | "critical";
    actionable?: boolean;
  }>;
  comparisons: {
    previousMonth?: string;
    changes: Array<{
      category: string;
      change: number;
      direction: "up" | "down";
    }>;
  };
  recommendations: string[];
  generatedAt: string;
}

class AIService {
  /**
   * Generate overview insights across all months
   */
  async generateOverviewInsights(
    userId: string,
    allMonthsData: MonthData[]
  ): Promise<OverviewInsights> {
    try {
      logger.info(
        `Generating overview insights for user ${userId} with ${allMonthsData.length} months`
      );

      if (!allMonthsData || allMonthsData.length === 0) {
        return this.getEmptyOverviewInsights();
      }

      if (!process.env.GEMINI_API_KEY) {
        logger.warn(
          "GEMINI_API_KEY not configured, returning fallback insights"
        );
        return this.getErrorOverviewInsights();
      }

      // Calculate aggregate statistics
      const totalIncome = allMonthsData.reduce(
        (sum, m) => sum + m.totalIncome,
        0
      );
      const totalExpense = allMonthsData.reduce(
        (sum, m) => sum + m.totalExpense,
        0
      );
      const netBalance = totalIncome - totalExpense;
      const avgMonthlyIncome = totalIncome / allMonthsData.length;
      const avgMonthlyExpense = totalExpense / allMonthsData.length;

      // Extract category trends and separate investment/medical/insurance
      const expensesByCategory: Record<string, number> = {};
      let investmentTotal = 0;
      let medicalTotal = 0;
      let insuranceTotal = 0;

      allMonthsData.forEach((month) => {
        month.expenses.forEach((exp) => {
          expensesByCategory[exp.category] =
            (expensesByCategory[exp.category] || 0) + exp.amount;

          // Track special categories
          if (exp.category.toLowerCase() === "investment") {
            investmentTotal += exp.amount;
          } else if (exp.category.toLowerCase() === "medical") {
            medicalTotal += exp.amount;
          } else if (exp.category.toLowerCase() === "insurance") {
            insuranceTotal += exp.amount;
          }
        });
      });

      // Get need/want/neutral breakdown
      let needTotal = 0,
        wantTotal = 0,
        neutralTotal = 0;
      allMonthsData.forEach((month) => {
        month.expenses.forEach((exp) => {
          exp.entries?.forEach((entry) => {
            if (entry.tag === "need") needTotal += entry.amount;
            else if (entry.tag === "want") wantTotal += entry.amount;
            else neutralTotal += entry.amount;
          });
        });
      });

      const prompt = `You are a financial advisor analyzing a user's expense tracking data. Generate comprehensive financial insights in JSON format.

IMPORTANT CONTEXT:
- Investment: This is NOT a regular expense - it's savings/wealth building. Treat it positively as financial discipline.
- Medical & Insurance: These are essential protection expenses for health and financial security.

User Financial Data:
- Total Months Tracked: ${allMonthsData.length}
- Total Income: ₹${totalIncome.toLocaleString()}
- Total Expenses: ₹${totalExpense.toLocaleString()}
- Net Balance: ₹${netBalance.toLocaleString()}
- Average Monthly Income: ₹${avgMonthlyIncome.toFixed(0)}
- Average Monthly Expense: ₹${avgMonthlyExpense.toFixed(0)}

Expense Breakdown by Type:
- Need Expenses: ₹${needTotal.toLocaleString()}
- Want Expenses: ₹${wantTotal.toLocaleString()}
- Neutral Expenses: ₹${neutralTotal.toLocaleString()}

Special Categories (Analyze Separately):
- Investment (Savings/Wealth Building): ₹${investmentTotal.toLocaleString()}
- Medical (Health Expenses): ₹${medicalTotal.toLocaleString()}
- Insurance (Financial Protection): ₹${insuranceTotal.toLocaleString()}

Top Expense Categories:
${Object.entries(expensesByCategory)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([cat, amt]) => `- ${cat}: ₹${amt.toLocaleString()}`)
  .join("\n")}

Monthly Trends:
${allMonthsData
  .slice(-6)
  .map(
    (m) =>
      `${
        m.monthName
      }: Income ₹${m.totalIncome.toLocaleString()}, Expenses ₹${m.totalExpense.toLocaleString()}, Balance ₹${m.carryForward.toLocaleString()}`
  )
  .join("\n")}

Provide:
1. A financial health score (0-100) based on savings rate, expense control, and trends
   - Give credit for Investment amounts as SAVINGS, not expenses
   - Consider Medical and Insurance as necessary protective spending
2. A brief summary (2-3 sentences) of overall financial health
3. 4-6 key insights covering:
   - Spending patterns on regular expenses
   - Investment/savings discipline (highlight positively)
   - Medical and Insurance coverage adequacy
   - Budget optimization opportunities
4. 2-3 predictions or forward-looking recommendations

Respond ONLY with valid JSON in this exact structure (no markdown, no code blocks):
{
  "financialHealthScore": 75,
  "summary": "Your financial summary here",
  "insights": [
    {
      "id": "insight-1",
      "title": "Short title",
      "description": "Detailed description",
      "category": "spending",
      "severity": "info",
      "actionable": true
    }
  ],
  "predictions": ["Prediction 1", "Prediction 2"]
}`;

      const model = genAI.getGenerativeModel({ model: MODEL });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response (Gemini might wrap it in markdown code blocks)
      let jsonText = text.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\n?/g, "");
      }

      const insights = JSON.parse(jsonText);
      insights.generatedAt = new Date().toISOString();

      logger.info(`Overview insights generated using Gemini ${MODEL}`);

      return insights as OverviewInsights;
    } catch (error) {
      logger.error("Error generating overview insights:", error);
      return this.getErrorOverviewInsights();
    }
  }

  /**
   * Generate monthly insights for a specific month
   */
  async generateMonthlyInsights(
    userId: string,
    monthData: MonthData,
    previousMonthData?: MonthData
  ): Promise<MonthlyInsights> {
    try {
      logger.info(
        `Generating monthly insights for user ${userId}, month ${monthData.monthName}`
      );

      if (!monthData) {
        return this.getEmptyMonthlyInsights();
      }

      if (!process.env.GEMINI_API_KEY) {
        logger.warn(
          "GEMINI_API_KEY not configured, returning fallback insights"
        );
        return this.getErrorMonthlyInsights();
      }

      // Calculate need/want/neutral for this month and track special categories
      let needTotal = 0,
        wantTotal = 0,
        neutralTotal = 0;
      let investmentTotal = 0;
      let medicalTotal = 0;
      let insuranceTotal = 0;

      monthData.expenses.forEach((exp) => {
        // Track special categories
        if (exp.category.toLowerCase() === "investment") {
          investmentTotal += exp.amount;
        } else if (exp.category.toLowerCase() === "medical") {
          medicalTotal += exp.amount;
        } else if (exp.category.toLowerCase() === "insurance") {
          insuranceTotal += exp.amount;
        }

        exp.entries?.forEach((entry) => {
          if (entry.tag === "need") needTotal += entry.amount;
          else if (entry.tag === "want") wantTotal += entry.amount;
          else neutralTotal += entry.amount;
        });
      });

      const savingsRate =
        monthData.totalIncome > 0
          ? ((monthData.carryForward / monthData.totalIncome) * 100).toFixed(1)
          : "0";

      let comparisonText = "";
      if (previousMonthData) {
        const incomeChange =
          ((monthData.totalIncome - previousMonthData.totalIncome) /
            previousMonthData.totalIncome) *
          100;
        const expenseChange =
          ((monthData.totalExpense - previousMonthData.totalExpense) /
            previousMonthData.totalExpense) *
          100;
        comparisonText = `
Previous Month Comparison (${previousMonthData.monthName}):
- Income Change: ${incomeChange >= 0 ? "+" : ""}${incomeChange.toFixed(1)}%
- Expense Change: ${expenseChange >= 0 ? "+" : ""}${expenseChange.toFixed(1)}%
- Previous Balance: ₹${previousMonthData.carryForward.toLocaleString()}
`;
      }

      const prompt = `You are a financial advisor analyzing a specific month's financial data. Provide detailed insights.

IMPORTANT CONTEXT:
- Investment: This is NOT a regular expense - it's savings/wealth building. Treat it positively as financial discipline.
- Medical & Insurance: These are essential protection expenses for health and financial security.

Month: ${monthData.monthName}
Total Income: ₹${monthData.totalIncome.toLocaleString()}
Total Expenses: ₹${monthData.totalExpense.toLocaleString()}
Carry Forward: ₹${monthData.carryForward.toLocaleString()}
Savings Rate: ${savingsRate}%

Expense Breakdown by Category:
${monthData.expenses
  .sort((a, b) => b.amount - a.amount)
  .map((exp) => `- ${exp.category}: ₹${exp.amount.toLocaleString()}`)
  .join("\n")}

Need/Want/Neutral Analysis:
- Need: ₹${needTotal.toLocaleString()} (${(
        (needTotal / monthData.totalExpense) *
        100
      ).toFixed(1)}%)
- Want: ₹${wantTotal.toLocaleString()} (${(
        (wantTotal / monthData.totalExpense) *
        100
      ).toFixed(1)}%)
- Neutral: ₹${neutralTotal.toLocaleString()} (${(
        (neutralTotal / monthData.totalExpense) *
        100
      ).toFixed(1)}%)

Special Categories (Analyze Separately):
- Investment (Savings/Wealth Building): ₹${investmentTotal.toLocaleString()}
- Medical (Health Expenses): ₹${medicalTotal.toLocaleString()}
- Insurance (Financial Protection): ₹${insuranceTotal.toLocaleString()}

${comparisonText}

Income Sources:
${monthData.income
  .map((inc) => `- ${inc.category}: ₹${inc.amount.toLocaleString()}`)
  .join("\n")}

Provide:
1. A month summary (2-3 sentences)
   - Recognize Investment as positive savings behavior
   - Acknowledge Medical and Insurance as necessary protective spending
2. 4-6 insights covering:
   - Regular expense category analysis
   - Investment/savings discipline (highlight positively)
   - Medical and Insurance adequacy
   - Need/want spending patterns
   - Notable changes from previous month
3. Comparison with previous month (if available)
4. 3-5 actionable recommendations

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "monthSummary": "Summary text",
  "insights": [
    {
      "id": "insight-1",
      "title": "Title",
      "description": "Description",
      "category": "spending",
      "severity": "info",
      "actionable": true
    }
  ],
  "comparisons": {
    "previousMonth": "${previousMonthData?.monthName || ""}",
    "changes": [
      {"category": "Category name", "change": 10.5, "direction": "up"}
    ]
  },
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

      const model = genAI.getGenerativeModel({ model: MODEL });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      let jsonText = text.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\n?/g, "");
      }

      const insights = JSON.parse(jsonText);
      insights.generatedAt = new Date().toISOString();

      logger.info(`Monthly insights generated using Gemini ${MODEL}`);

      return insights as MonthlyInsights;
    } catch (error) {
      logger.error("Error generating monthly insights:", error);
      return this.getErrorMonthlyInsights();
    }
  }

  private getEmptyOverviewInsights(): OverviewInsights {
    return {
      financialHealthScore: 50,
      summary:
        "No financial data available yet. Start tracking your income and expenses to receive personalized insights.",
      insights: [
        {
          id: "empty-1",
          title: "Get Started",
          description:
            "Begin by adding your first financial period to track your income and expenses.",
          category: "health",
          severity: "info",
          actionable: true,
        },
      ],
      predictions: [],
      generatedAt: new Date().toISOString(),
    };
  }

  private getErrorOverviewInsights(): OverviewInsights {
    return {
      financialHealthScore: 50,
      summary:
        "Unable to generate insights at this time. Please try again later or configure your Gemini API key.",
      insights: [
        {
          id: "error-1",
          title: "Insights Unavailable",
          description:
            "We encountered an issue generating your financial insights. Your data is safe. Check your Gemini API configuration.",
          category: "health",
          severity: "warning",
          actionable: false,
        },
      ],
      predictions: [],
      generatedAt: new Date().toISOString(),
    };
  }

  private getEmptyMonthlyInsights(): MonthlyInsights {
    return {
      monthSummary: "No data available for this month.",
      insights: [],
      comparisons: {
        changes: [],
      },
      recommendations: ["Add income and expense entries to receive insights."],
      generatedAt: new Date().toISOString(),
    };
  }

  private getErrorMonthlyInsights(): MonthlyInsights {
    return {
      monthSummary: "Unable to generate insights at this time.",
      insights: [
        {
          id: "error-1",
          title: "Insights Unavailable",
          description:
            "Please try again later or configure your Gemini API key.",
          category: "health",
          severity: "warning",
          actionable: false,
        },
      ],
      comparisons: {
        changes: [],
      },
      recommendations: [],
      generatedAt: new Date().toISOString(),
    };
  }
}

export default new AIService();
