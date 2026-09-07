export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateAmount(
  amount: string | number
): ValidationResult {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: "Please enter a valid number" };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, error: "Amount must be greater than 0" };
  }
  
  return { isValid: true };
}

export function validateRequired(
  value: string,
  fieldName: string = "This field"
): ValidationResult {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true };
}

export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string = "This field"
): ValidationResult {
  if (value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }
  
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  return validateMinLength(password, 4, "Password");
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }
  
  return { isValid: true };
}

export function validateUsername(username: string): ValidationResult {
  if (!username || !username.trim()) {
    return { isValid: false, error: "Username is required" };
  }
  
  if (username.length < 3) {
    return {
      isValid: false,
      error: "Username must be at least 3 characters",
    };
  }
  
  return { isValid: true };
}

