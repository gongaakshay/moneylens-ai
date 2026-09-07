module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFilesAfterEnv: ["<rootDir>/src/tests-setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
  ],
  coverageDirectory: "coverage",
  verbose: true,
  testTimeout: 30000,
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        isolatedModules: true,
      },
    ],
  },
};
