const fs = require('fs');

// Function to convert from any base to decimal using BigInt
function convertToDecimal(value, base) {
    let result = 0n;
    const bigBase = BigInt(base);
    
    for (let i = 0; i < value.length; i++) {
        const digit = value[i];
        let digitValue;
        
        if (digit >= '0' && digit <= '9') {
            digitValue = BigInt(digit);
        } else {
            // Handle hex digits a-f (case insensitive)
            digitValue = BigInt(digit.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 10);
        }
        
        result = result * bigBase + digitValue;
    }
    
    return result;
}

// Function to perform Lagrange interpolation and find the constant term
function lagrangeInterpolation(points) {
    const n = points.length;
    let result = 0n;
    
    // Calculate the constant term using Lagrange interpolation
    // f(0) = sum of (y_i * product of (-x_j)/(x_i - x_j) for all j != i)
    for (let i = 0; i < n; i++) {
        let numerator = points[i].y;
        let denominator = 1n;
        
        // Calculate the Lagrange basis polynomial at x = 0
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                numerator = numerator * BigInt(-points[j].x);
                denominator = denominator * BigInt(points[i].x - points[j].x);
            }
        }
        
        result += numerator / denominator;
    }
    
    return result;
}

// Function to solve the secret sharing problem
function solveSecretSharing(testCase) {
    const n = testCase.keys.n;
    const k = testCase.keys.k;
    
    // Extract points from the test case
    const points = [];
    
    for (let i = 1; i <= n; i++) {
        if (testCase[i.toString()]) {
            const base = parseInt(testCase[i.toString()].base);
            const value = testCase[i.toString()].value;
            
            // Convert value from given base to decimal
            const decimalValue = convertToDecimal(value, base);
            
            points.push({
                x: i,
                y: decimalValue
            });
        }
    }
    
    // We only need k points to solve for the polynomial
    const selectedPoints = points.slice(0, k);
    
    // Find the secret (constant term) using Lagrange interpolation
    const secret = lagrangeInterpolation(selectedPoints);
    
    return secret;
}

// Function to read JSON from file and solve
function solveFromFile(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        const testCase = JSON.parse(data);
        const result = solveSecretSharing(testCase);
        console.log(`Secret for ${filename}: ${result}`);
        return result;
    } catch (error) {
        console.error(`Error reading file ${filename}:`, error);
        return null;
    }
}

// Test Case 1
const testCase1 = {
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": {
        "base": "10",
        "value": "4"
    },
    "2": {
        "base": "2",
        "value": "111"
    },
    "3": {
        "base": "10",
        "value": "12"
    },
    "6": {
        "base": "4",
        "value": "213"
    }
};

// Test Case 2
const testCase2 = {
    "keys": {
        "n": 10,
        "k": 7
    },
    "1": {
        "base": "6",
        "value": "13444211440455345511"
    },
    "2": {
        "base": "15",
        "value": "aed7015a346d635"
    },
    "3": {
        "base": "15",
        "value": "6aeeb69631c227c"
    },
    "4": {
        "base": "16",
        "value": "e1b5e05623d881f"
    },
    "5": {
        "base": "8",
        "value": "316034514573652620673"
    },
    "6": {
        "base": "3",
        "value": "2122212201122002221120200210011020220200"
    },
    "7": {
        "base": "3",
        "value": "20120221122211000100210021102001201112121"
    },
    "8": {
        "base": "6",
        "value": "20220554335330240002224253"
    },
    "9": {
        "base": "12",
        "value": "45153788322a1255483"
    },
    "10": {
        "base": "7",
        "value": "1101613130313526312514143"
    }
};

// Main execution
function main() {
    console.log("=== Hashira Placements Assignment - Shamir's Secret Sharing ===");
    console.log();
    
    // Solve Test Case 1
    console.log("Test Case 1:");
    const result1 = solveSecretSharing(testCase1);
    console.log(`Secret: ${result1}`);
    console.log();
    
    // Solve Test Case 2
    console.log("Test Case 2:");
    const result2 = solveSecretSharing(testCase2);
    console.log(`Secret: ${result2}`);
    console.log();
    
    // Summary
    console.log("=== FINAL ANSWERS ===");
    console.log(`Test Case 1: ${result1}`);
    console.log(`Test Case 2: ${result2}`);
    
    return { testCase1: result1, testCase2: result2 };
}

// Run if this file is executed directly
if (require.main === module) {
    main();
}

// Export functions for use in other files
module.exports = {
    solveSecretSharing,
    solveFromFile,
    convertToDecimal,
    lagrangeInterpolation,
    main
};
