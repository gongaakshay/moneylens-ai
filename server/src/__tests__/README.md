# E2E Test Suite for MoneyLens.ai

## Overview

This comprehensive End-to-End test suite ensures the accuracy and reliability of all calculations in the MoneyLens.ai application. Since this is a financial application, calculation precision is critical.

## What's Tested

### 1. **Authentication**

- User registration with validation
- Setting and updating security questions
- Retrieving security questions by username
- Password reset via security questions
- Admin account protection from password resets
- Login with valid/invalid credentials
- Username and password length requirements
- Security answer validation

### 2. **Month Data Management**

- Creating new months
- Preventing duplicate months
- Fetching months (all and by ID)
- Error handling for non-existent months

### 3. **Income Operations with Calculation Verification**

- Adding income entries to new categories
- Adding multiple entries to existing categories
- Updating income entries
- Deleting income entries
- **Critical**: Verifying that category totals = sum of all entries
- **Critical**: Verifying that totalIncome = sum of all category amounts

### 4. **Expense Operations with Tag Verification**

- Adding expenses with different tags (need, want, neutral)
- Multiple entries per category
- Updating expense entries including tag changes
- Deleting expense entries
- **Critical**: Verifying category calculations
- **Critical**: Verifying tag-based categorization

### 5. **Complex Calculation Scenarios**

- Multiple simultaneous operations
- Decimal/float amount handling
- Large number handling
- Zero amount handling
- **Critical**: carryForward = totalIncome - totalExpense

### 6. **Recurring Expenses**

- Create, Read, Update, Delete (CRUD) operations
- Validation of recurring expense properties

### 7. **Carry Forward Between Months**

- Proper carry forward from previous month
- Independent calculations per month
- Carry forward as income entry in new month

### 8. **Edge Cases**

- Zero amounts
- Large numbers (9,999,999.99)
- Missing required fields
- Non-existent resource operations

## Key Calculation Verifications

Every test verifies the following calculation integrity:

```
✅ Category Amount = Sum of all entry amounts in that category
✅ Total Income = Sum of all income category amounts
✅ Total Expense = Sum of all expense category amounts
✅ Carry Forward = Total Income - Total Expense
✅ Next Month Carry Forward = Previous Month Carry Forward (as income entry)
```

## Running the Tests

### Prerequisites

1. MongoDB connection must be configured
2. `DB_PASSWORD` environment variable must be set
3. Dependencies installed (`yarn install`)

### Commands

```bash
# Run all tests
yarn test

# Run only E2E tests
yarn test:e2e

# Run tests in watch mode (for development)
yarn test:watch

# Run tests with coverage
yarn test --coverage
```

## Test Isolation

- Each test run creates a unique test user to avoid conflicts
- All test data is cleaned up in the `afterAll` hook
- Tests are designed to run in sequence (`runInBand` flag for E2E)

## Expected Output

```
PASS  src/__tests__/e2e.test.ts
  E2E Tests - MoneyLens.ai API with Calculation Verification
    Authentication
      ✓ should register a new user
      ✓ should login with valid credentials
      ✓ should reject login with invalid credentials
      ✓ should reject short username during registration
      ✓ should reject short password during registration
    Month Data Management
      ✓ should create a new month
      ✓ should prevent duplicate month creation
      ...
    Income Operations with Calculation Verification
      ✓ should add first income entry and calculate correctly
      ✓ should add second income entry to same category and recalculate
      ✓ should add income to different category and recalculate totals
      ...
    [All 40+ tests pass]
```

## Debugging Failed Tests

If a calculation test fails, check:

1. **Service Layer Logic**: `src/services/MonthDataService.ts`

   - Look at `recalculateMonth()` method
   - Verify entry addition/deletion logic

2. **Database State**: Ensure MongoDB is running and accessible

3. **Test Isolation**: Verify cleanup is working properly

4. **Floating Point Precision**: Use `toBeCloseTo()` for decimal comparisons

## Adding New Tests

When adding new features, ensure you:

1. Test the happy path
2. Test error conditions
3. Verify all calculations affected by the feature
4. Test edge cases (zero, negative, large numbers)
5. Maintain test isolation

## Performance

- Full test suite runs in ~30 seconds
- Individual test groups can be run with `-t` flag:

```bash
# Run only calculation tests
yarn test -t "Calculation"

# Run only income tests
yarn test -t "Income Operations"
```

## CI/CD Integration

These tests should be run:

- Before every commit (pre-commit hook)
- On every pull request
- Before deployment to production

## Maintenance

- Update tests when adding new features
- Keep test data realistic but minimal
- Document any test-specific configuration
- Review and update this README as tests evolve
