# Hashira Placements Assignment - Shamir's Secret Sharing

## Problem Solution

This repository contains the complete solution for the Hashira Placements Assignment implementing Shamir's Secret Sharing algorithm.

## 🎯 Final Answers

- **Test Case 1: 3**
- **Test Case 2: 79210893618878683638**

```

## 🚀 How to Run

### Method 1: Direct Execution
```bash
node shamir_solver.js
```

### Method 2: Using npm
```bash
npm start
```

### Method 3: Reading from JSON files
```javascript
const { solveFromFile } = require('./shamir_solver');

// Solve from JSON file
solveFromFile('testcase1.json');  // Output: 3
solveFromFile('testcase2.json');  // Output: 79210893618878683638
```

## 🔧 Requirements

- Node.js >= 14.0.0 (for BigInt support)
- No external dependencies

## 📋 Algorithm Details

### 1. Base Conversion
Converts numbers from any base (2-16) to decimal using BigInt for precision:
- Supports numeric digits (0-9)
- Supports alphabetic digits (a-f for bases > 10)
- Handles large numbers without precision loss

### 2. Lagrange Interpolation
Uses the mathematical formula to find f(0):

```
f(0) = Σ(i=0 to k-1) yi * Π(j=0 to k-1, j≠i) (-xj)/(xi - xj)
```

### 3. Point Selection
- Takes first `k` available points from `n` total points
- Ensures polynomial reconstruction with minimum required points

## 📊 Test Case Details

### Test Case 1
- **Points needed:** 3 (for degree-2 polynomial)
- **Conversions:**
  - Point 1: base 10, "4" → 4
  - Point 2: base 2, "111" → 7
  - Point 3: base 10, "12" → 12
  - Point 6: base 4, "213" → 39
- **Secret:** 3

### Test Case 2  
- **Points needed:** 7 (for degree-6 polynomial)
- **Large numbers with various bases (3,6,7,8,12,15,16)**
- **Secret:** 79210893618878683638

## ✅ Verification

### Test Case 1 Verification:
If secret = 3, polynomial is f(x) = x² + 3

Check:
- f(1) = 1 + 3 = 4 ✓
- f(2) = 4 + 3 = 7 ✓  
- f(3) = 9 + 3 = 12 ✓
- f(6) = 36 + 3 = 39 ✓

## 🔍 Usage Examples

```javascript
const { solveSecretSharing } = require('./shamir_solver');

// Direct JSON object solving
const result = solveSecretSharing(jsonTestCase);
console.log(`Secret: ${result}`);

// File-based solving
const fileResult = solveFromFile('testcase.json');
```

## 📈 Output Format

```
=== Hashira Placements Assignment - Shamir's Secret Sharing ===

Test Case 1:
Secret: 3

Test Case 2:
Secret: 79210893618878683638

=== FINAL ANSWERS ===
Test Case 1: 3
Test Case 2: 79210893618878683638
```

## 🏆 Solution Features

- ✅ Handles multiple number bases (2-16)
- ✅ Uses BigInt for large number precision
- ✅ Implements correct Lagrange interpolation
- ✅ Supports both embedded and file-based test cases
- ✅ Produces exact answers for given test cases
- ✅ Modular design with exported functions
- ✅ Comprehensive error handling

## 📝 License

MIT License - Feel free to use and modify.
