import request from "supertest";
import mongoose from "mongoose";
import app from "../index";
import { User, MonthData, RecurringExpense } from "../models";
import { connectDatabase, disconnectDatabase } from "../config/database";

describe("E2E Tests - MoneyLens.ai API with Calculation Verification", () => {
  let userId: string;
  let monthId: string;
  let recurringId: string;
  let testUsername: string;

  beforeAll(async () => {
    // Connect to database before running tests
    if (!process.env.DB_PASSWORD) {
      throw new Error("DB_PASSWORD not set");
    }

    await connectDatabase();
    testUsername = `testuser_${Date.now()}`;
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    if (userId) {
      await User.deleteOne({ _id: userId });
    }
    if (monthId) {
      await MonthData.deleteOne({ _id: monthId });
    }
    if (recurringId) {
      await RecurringExpense.deleteOne({ _id: recurringId });
    }

    await disconnectDatabase();
  });

  describe("Authentication", () => {
    it("should register a new user", async () => {
      const response = await request(app).post("/api/auth/register").send({
        username: testUsername,
        password: "testpass123",
        name: "Test User",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("username");
      expect(response.body.username).toBe(testUsername);
      userId = response.body.id;
    });

    it("should set security question for user", async () => {
      const response = await request(app)
        .post("/api/auth/security-question")
        .send({
          userId,
          question: "What is your pet's name?",
          answer: "Fluffy",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });

    it("should retrieve security question by username", async () => {
      const response = await request(app).get(
        `/api/auth/security-question/${testUsername}`
      );

      expect(response.status).toBe(200);
      expect(response.body.question).toBe("What is your pet's name?");
      expect(response.body.hasSecurityQuestion).toBe(true);
      expect(response.body.isAdmin).toBe(false);
    });

    it("should login with valid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: testUsername,
        password: "testpass123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body.id).toBe(userId);
    });

    it("should reset password using security question", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password-security")
        .send({
          username: testUsername,
          securityAnswer: "Fluffy",
          newPassword: "newpass456",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();

      // Verify login with new password
      const loginResponse = await request(app).post("/api/auth/login").send({
        username: testUsername,
        password: "newpass456",
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.id).toBe(userId);
    });

    it("should update security question with current password", async () => {
      const response = await request(app)
        .put("/api/auth/security-question")
        .send({
          userId,
          currentPassword: "newpass456",
          question: "What city were you born in?",
          answer: "Mumbai",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();

      // Verify question was updated
      const getResponse = await request(app).get(
        `/api/auth/security-question/${testUsername}`
      );
      expect(getResponse.body.question).toBe("What city were you born in?");
    });

    it("should reject password reset with wrong security answer", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password-security")
        .send({
          username: testUsername,
          securityAnswer: "WrongAnswer",
          newPassword: "hackpass123",
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain("Invalid");
    });

    it("should prevent admin password reset via security questions", async () => {
      const response = await request(app).get(
        "/api/auth/security-question/admin"
      );

      expect(response.status).toBe(200);
      expect(response.body.isAdmin).toBe(true);

      const resetResponse = await request(app)
        .post("/api/auth/reset-password-security")
        .send({
          username: "admin",
          securityAnswer: "anything",
          newPassword: "hack123",
        });

      expect(resetResponse.status).toBe(403);
      expect(resetResponse.body.error).toContain("admin");
    });

    it("should reject login with invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "nonexistent",
        password: "wrongpass",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should reject short username during registration", async () => {
      const response = await request(app).post("/api/auth/register").send({
        username: "ab",
        password: "testpass123",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("at least 3 characters");
    });

    it("should reject short password during registration", async () => {
      const response = await request(app).post("/api/auth/register").send({
        username: "testuser123",
        password: "123",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("at least 4 characters");
    });
  });

  describe("Month Data Management", () => {
    it("should create a new month", async () => {
      const response = await request(app).post("/api/data/month").send({
        userId,
        year: 2025,
        month: 0, // January
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.monthName).toBe("January 2025");
      expect(response.body.totalIncome).toBe(0);
      expect(response.body.totalExpense).toBe(0);
      expect(response.body.carryForward).toBe(0);
      monthId = response.body._id;
    });

    it("should prevent duplicate month creation", async () => {
      const response = await request(app).post("/api/data/month").send({
        userId,
        year: 2025,
        month: 0, // January again
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("already exists");
    });

    it("should fetch all months for a user", async () => {
      const response = await request(app).get(`/api/data?userId=${userId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]._id).toBe(monthId);
    });

    it("should fetch a specific month by ID", async () => {
      const response = await request(app).get(`/api/data/month/${monthId}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(monthId);
    });

    it("should return 404 for non-existent month", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).get(`/api/data/month/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });

  describe("Income Operations with Calculation Verification", () => {
    let incomeEntry1Id: string;
    let incomeEntry2Id: string;
    let incomeEntry3Id: string;

    it("should add first income entry and calculate correctly", async () => {
      const response = await request(app).post("/api/data/income/entry").send({
        monthId,
        category: "Salary",
        amount: 50000,
        note: "Monthly salary",
      });

      expect(response.status).toBe(201);

      // Verify income category was created
      expect(response.body.income).toBeDefined();
      const salaryIncome = response.body.income.find(
        (i: any) => i.category === "Salary"
      );
      expect(salaryIncome).toBeDefined();
      expect(salaryIncome.amount).toBe(50000);
      expect(salaryIncome.entries).toHaveLength(1);
      expect(salaryIncome.entries[0].amount).toBe(50000);

      // Verify total calculations
      expect(response.body.totalIncome).toBe(50000);
      expect(response.body.totalExpense).toBe(0);
      expect(response.body.carryForward).toBe(50000);

      incomeEntry1Id = salaryIncome.entries[0].id;
    });

    it("should add second income entry to same category and recalculate", async () => {
      const response = await request(app).post("/api/data/income/entry").send({
        monthId,
        category: "Salary",
        amount: 5000,
        note: "Bonus",
      });

      expect(response.status).toBe(201);

      const salaryIncome = response.body.income.find(
        (i: any) => i.category === "Salary"
      );
      expect(salaryIncome).toBeDefined();
      expect(salaryIncome.entries).toHaveLength(2);

      // Category total should be sum of both entries
      expect(salaryIncome.amount).toBe(55000); // 50000 + 5000

      // Total income should be updated
      expect(response.body.totalIncome).toBe(55000);
      expect(response.body.carryForward).toBe(55000);

      incomeEntry2Id = salaryIncome.entries[1].id;
    });

    it("should add income to different category and recalculate totals", async () => {
      const response = await request(app).post("/api/data/income/entry").send({
        monthId,
        category: "Freelance",
        amount: 15000,
        note: "Project payment",
      });

      expect(response.status).toBe(201);

      expect(response.body.income).toHaveLength(2); // Salary + Freelance

      const salaryIncome = response.body.income.find(
        (i: any) => i.category === "Salary"
      );
      const freelanceIncome = response.body.income.find(
        (i: any) => i.category === "Freelance"
      );

      expect(salaryIncome.amount).toBe(55000);
      expect(freelanceIncome.amount).toBe(15000);

      // Total income = 55000 + 15000 = 70000
      expect(response.body.totalIncome).toBe(70000);
      expect(response.body.carryForward).toBe(70000);

      incomeEntry3Id = freelanceIncome.entries[0].id;
    });

    it("should update income entry and recalculate category and totals", async () => {
      const response = await request(app)
        .put(`/api/data/income/entry/${incomeEntry2Id}`)
        .send({
          monthId,
          amount: 10000, // Changed from 5000 to 10000
          note: "Performance bonus",
        });

      expect(response.status).toBe(200);

      const salaryIncome = response.body.income.find(
        (i: any) => i.category === "Salary"
      );

      // Category total: 50000 + 10000 = 60000
      expect(salaryIncome.amount).toBe(60000);

      // Total income: 60000 (Salary) + 15000 (Freelance) = 75000
      expect(response.body.totalIncome).toBe(75000);
      expect(response.body.carryForward).toBe(75000);
    });

    it("should delete income entry and recalculate", async () => {
      const response = await request(app)
        .delete(`/api/data/income/entry/${incomeEntry3Id}`)
        .send({ monthId });

      expect(response.status).toBe(200);

      // Freelance category should be removed (had only 1 entry)
      const freelanceIncome = response.body.income.find(
        (i: any) => i.category === "Freelance"
      );
      expect(freelanceIncome).toBeUndefined();

      // Total income: 60000 (only Salary remains)
      expect(response.body.totalIncome).toBe(60000);
      expect(response.body.carryForward).toBe(60000);
    });
  });

  describe("Expense Operations with Tag Verification", () => {
    let expenseEntry1Id: string;
    let expenseEntry2Id: string;
    let expenseEntry3Id: string;
    let expenseEntry4Id: string;

    it("should add expense with NEED tag and calculate", async () => {
      const response = await request(app).post("/api/data/expense/entry").send({
        monthId,
        category: "Rent",
        amount: 25000,
        note: "Monthly rent",
        tag: "need",
      });

      expect(response.status).toBe(201);

      const rentExpense = response.body.expenses.find(
        (e: any) => e.category === "Rent"
      );
      expect(rentExpense).toBeDefined();
      expect(rentExpense.amount).toBe(25000);
      expect(rentExpense.entries[0].tag).toBe("need");

      // Total expense = 25000
      expect(response.body.totalExpense).toBe(25000);

      // Carry forward = 60000 (income) - 25000 (expense) = 35000
      expect(response.body.carryForward).toBe(35000);

      expenseEntry1Id = rentExpense.entries[0].id;
    });

    it("should add multiple expenses to same category with different tags", async () => {
      // Add first groceries expense (NEED)
      let response = await request(app).post("/api/data/expense/entry").send({
        monthId,
        category: "Groceries",
        amount: 5000,
        note: "Essential groceries",
        tag: "need",
      });

      expect(response.status).toBe(201);
      const groceriesAfterFirst = response.body.expenses.find(
        (e: any) => e.category === "Groceries"
      );
      expenseEntry2Id = groceriesAfterFirst.entries[0].id;

      // Add second groceries expense (WANT)
      response = await request(app).post("/api/data/expense/entry").send({
        monthId,
        category: "Groceries",
        amount: 3000,
        note: "Snacks and treats",
        tag: "want",
      });

      expect(response.status).toBe(201);

      const groceries = response.body.expenses.find(
        (e: any) => e.category === "Groceries"
      );
      expect(groceries.entries).toHaveLength(2);
      expect(groceries.amount).toBe(8000); // 5000 + 3000
      expect(groceries.entries[0].tag).toBe("need");
      expect(groceries.entries[1].tag).toBe("want");

      // Total expense = 25000 (Rent) + 8000 (Groceries) = 33000
      expect(response.body.totalExpense).toBe(33000);

      // Carry forward = 60000 - 33000 = 27000
      expect(response.body.carryForward).toBe(27000);

      expenseEntry3Id = groceries.entries[1].id;
    });

    it("should add expense with NEUTRAL tag", async () => {
      const response = await request(app).post("/api/data/expense/entry").send({
        monthId,
        category: "Investment",
        amount: 10000,
        note: "Mutual fund SIP",
        tag: "neutral",
      });

      expect(response.status).toBe(201);

      const investment = response.body.expenses.find(
        (e: any) => e.category === "Investment"
      );
      expect(investment.entries[0].tag).toBe("neutral");

      // Total expense = 33000 + 10000 = 43000
      expect(response.body.totalExpense).toBe(43000);

      // Carry forward = 60000 - 43000 = 17000
      expect(response.body.carryForward).toBe(17000);

      expenseEntry4Id = investment.entries[0].id;
    });

    it("should update expense entry including tag change", async () => {
      const response = await request(app)
        .put(`/api/data/expense/entry/${expenseEntry3Id}`)
        .send({
          monthId,
          amount: 2000, // Changed from 3000
          note: "Reduced treats",
          tag: "need", // Changed from want to need
        });

      expect(response.status).toBe(200);

      const groceries = response.body.expenses.find(
        (e: any) => e.category === "Groceries"
      );
      const updatedEntry = groceries.entries.find(
        (e: any) => e.id === expenseEntry3Id
      );

      expect(updatedEntry.amount).toBe(2000);
      expect(updatedEntry.tag).toBe("need");

      // Groceries total: 5000 + 2000 = 7000
      expect(groceries.amount).toBe(7000);

      // Total expense = 25000 (Rent) + 7000 (Groceries) + 10000 (Investment) = 42000
      expect(response.body.totalExpense).toBe(42000);

      // Carry forward = 60000 - 42000 = 18000
      expect(response.body.carryForward).toBe(18000);
    });

    it("should delete expense entry and recalculate", async () => {
      const response = await request(app)
        .delete(`/api/data/expense/entry/${expenseEntry4Id}`)
        .send({ monthId });

      expect(response.status).toBe(200);

      // Investment category should be removed
      const investment = response.body.expenses.find(
        (e: any) => e.category === "Investment"
      );
      expect(investment).toBeUndefined();

      // Total expense = 25000 (Rent) + 7000 (Groceries) = 32000
      expect(response.body.totalExpense).toBe(32000);

      // Carry forward = 60000 - 32000 = 28000
      expect(response.body.carryForward).toBe(28000);
    });
  });

  describe("Complex Calculation Scenarios", () => {
    it("should handle multiple simultaneous operations and maintain accuracy", async () => {
      // Add income
      await request(app).post("/api/data/income/entry").send({
        monthId,
        category: "Bonus",
        amount: 20000,
        note: "Annual bonus",
      });

      // Add expense
      await request(app).post("/api/data/expense/entry").send({
        monthId,
        category: "Entertainment",
        amount: 5000,
        note: "Movie tickets and dining",
        tag: "want",
      });

      // Fetch and verify final state
      const response = await request(app).get(`/api/data/month/${monthId}`);

      expect(response.status).toBe(200);

      // Income: 60000 (Salary with bonus) + 20000 (Bonus) = 80000
      expect(response.body.totalIncome).toBe(80000);

      // Expense: 32000 (previous) + 5000 (Entertainment) = 37000
      expect(response.body.totalExpense).toBe(37000);

      // Carry forward: 80000 - 37000 = 43000
      expect(response.body.carryForward).toBe(43000);

      // Verify each category calculates correctly
      const salaryIncome = response.body.income.find(
        (i: any) => i.category === "Salary"
      );
      const bonusIncome = response.body.income.find(
        (i: any) => i.category === "Bonus"
      );

      expect(salaryIncome.amount).toBe(60000);
      expect(bonusIncome.amount).toBe(20000);

      // Verify sum of all income categories = totalIncome
      const sumIncome = response.body.income.reduce(
        (sum: number, i: any) => sum + i.amount,
        0
      );
      expect(sumIncome).toBe(response.body.totalIncome);

      // Verify sum of all expense categories = totalExpense
      const sumExpense = response.body.expenses.reduce(
        (sum: number, e: any) => sum + e.amount,
        0
      );
      expect(sumExpense).toBe(response.body.totalExpense);
    });

    it("should verify each category sum matches its entries", async () => {
      const response = await request(app).get(`/api/data/month/${monthId}`);

      expect(response.status).toBe(200);

      // Check each income category
      for (const income of response.body.income) {
        const entriesSum = income.entries.reduce(
          (sum: number, entry: any) => sum + entry.amount,
          0
        );
        expect(income.amount).toBe(entriesSum);
      }

      // Check each expense category
      for (const expense of response.body.expenses) {
        const entriesSum = expense.entries.reduce(
          (sum: number, entry: any) => sum + entry.amount,
          0
        );
        expect(expense.amount).toBe(entriesSum);
      }
    });

    it("should handle decimal/float amounts correctly", async () => {
      const response = await request(app).post("/api/data/expense/entry").send({
        monthId,
        category: "Groceries",
        amount: 1234.56,
        note: "Test decimal",
        tag: "need",
      });

      expect(response.status).toBe(201);

      const groceries = response.body.expenses.find(
        (e: any) => e.category === "Groceries"
      );
      const newEntry = groceries.entries[groceries.entries.length - 1];

      expect(newEntry.amount).toBe(1234.56);

      // Verify total includes the decimal amount correctly
      const expectedGroceriesTotal = groceries.entries.reduce(
        (sum: number, e: any) => sum + e.amount,
        0
      );
      expect(groceries.amount).toBeCloseTo(expectedGroceriesTotal, 2);
    });
  });

  describe("Recurring Expenses", () => {
    it("should create a recurring expense", async () => {
      const response = await request(app).post("/api/recurring").send({
        userId,
        category: "Netflix",
        amount: 649,
        note: "Premium subscription",
        tag: "want",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.amount).toBe(649);
      expect(response.body.tag).toBe("want");
      recurringId = response.body._id;
    });

    it("should fetch all recurring expenses", async () => {
      const response = await request(app).get(
        `/api/recurring?userId=${userId}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const netflix = response.body.find((r: any) => r.category === "Netflix");
      expect(netflix).toBeDefined();
    });

    it("should update a recurring expense", async () => {
      const response = await request(app)
        .put(`/api/recurring/${recurringId}`)
        .send({
          amount: 799,
          note: "Premium plan upgrade",
          tag: "want",
        });

      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(799);
    });

    it("should delete a recurring expense", async () => {
      const response = await request(app).delete(
        `/api/recurring/${recurringId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      recurringId = ""; // Clear so afterAll doesn't try to delete again
    });
  });

  describe("Carry Forward to Next Month", () => {
    let februaryMonthId: string;

    it("should create February with carry forward from January", async () => {
      // Get January's carry forward
      const januaryResponse = await request(app).get(
        `/api/data/month/${monthId}`
      );

      const januaryCarryForward = januaryResponse.body.carryForward;
      expect(januaryCarryForward).toBeGreaterThan(0);

      // Create February
      const response = await request(app).post("/api/data/month").send({
        userId,
        year: 2025,
        month: 1, // February
      });

      expect(response.status).toBe(201);
      februaryMonthId = response.body._id;

      // Verify carry forward income was added
      const carryForwardIncome = response.body.income.find(
        (i: any) => i.category === "Carry Forward"
      );

      expect(carryForwardIncome).toBeDefined();
      expect(carryForwardIncome.amount).toBe(januaryCarryForward);
      expect(response.body.totalIncome).toBe(januaryCarryForward);
      expect(response.body.carryForward).toBe(januaryCarryForward);
    });

    it("should maintain separate calculations for each month", async () => {
      // Add expense to February
      await request(app).post("/api/data/expense/entry").send({
        monthId: februaryMonthId,
        category: "Rent",
        amount: 25000,
        note: "February rent",
        tag: "need",
      });

      // Verify January is unchanged
      const januaryResponse = await request(app).get(
        `/api/data/month/${monthId}`
      );

      const februaryResponse = await request(app).get(
        `/api/data/month/${februaryMonthId}`
      );

      // January should still have its original values
      expect(januaryResponse.body.totalExpense).toBeGreaterThan(0);

      // February should have its own calculations
      expect(februaryResponse.body.totalExpense).toBe(25000);
      expect(februaryResponse.body.carryForward).toBe(
        februaryResponse.body.totalIncome - 25000
      );

      // Cleanup February for afterAll
      await MonthData.deleteOne({ _id: februaryMonthId });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle zero amounts", async () => {
      const response = await request(app).post("/api/data/income/entry").send({
        monthId,
        category: "Test Zero",
        amount: 0,
        note: "Zero amount test",
      });

      expect(response.status).toBe(201);

      const testIncome = response.body.income.find(
        (i: any) => i.category === "Test Zero"
      );
      expect(testIncome.amount).toBe(0);
    });

    it("should handle large numbers correctly", async () => {
      const largeAmount = 9999999.99;

      const response = await request(app).post("/api/data/income/entry").send({
        monthId,
        category: "Large Amount",
        amount: largeAmount,
        note: "Testing large numbers",
      });

      expect(response.status).toBe(201);

      const largeIncome = response.body.income.find(
        (i: any) => i.category === "Large Amount"
      );
      expect(largeIncome.amount).toBe(largeAmount);

      // Verify it's included in total
      expect(response.body.totalIncome).toBeGreaterThan(largeAmount);
    });

    it("should reject missing required fields", async () => {
      const response = await request(app).post("/api/data/income/entry").send({
        monthId,
        // Missing category and amount
        note: "Invalid request",
      });

      expect(response.status).toBe(400);
    });

    it("should handle non-existent entry deletion gracefully", async () => {
      const fakeEntryId = "entry-nonexistent-123";

      const response = await request(app)
        .delete(`/api/data/income/entry/${fakeEntryId}`)
        .send({ monthId });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain("not found");
    });
  });
});
