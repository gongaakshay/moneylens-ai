import bcrypt from "bcrypt";
import { User } from "../models";
import { logger } from "../config/logger";

const SALT_ROUNDS = 10;

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  currency: string;
}

export class AuthService {
  /**
   * Authenticate user with username and password
   */
  async login(username: string, password: string): Promise<AuthUser> {
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    logger.info(`User logged in: ${username}`);

    return {
      id: user._id.toString(),
      username: user.username,
      name: user.name || username,
      currency: user.currency || "INR",
    };
  }

  /**
   * Register a new user
   */
  async register(
    username: string,
    password: string,
    name?: string,
    securityQuestion?: string,
    securityAnswer?: string
  ): Promise<AuthUser> {
    // Validate username length
    if (username.length < 3) {
      throw new Error("USERNAME_TOO_SHORT");
    }

    // Validate password length
    if (password.length < 4) {
      throw new Error("PASSWORD_TOO_SHORT");
    }

    // Validate security answer if provided
    if (securityQuestion && securityAnswer && securityAnswer.length < 3) {
      throw new Error("ANSWER_TOO_SHORT");
    }

    // Check if username already exists
    const existingUser = await User.countDocuments({ username });
    if (existingUser > 0) {
      throw new Error("USERNAME_EXISTS");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Prepare user data
    const userData: {
      username: string;
      password: string;
      name: string;
      currency: "USD" | "INR";
      securityQuestion?: string;
      securityAnswerHash?: string;
      hasConfiguredSecurity?: boolean;
    } = {
      username,
      password: hashedPassword,
      name: name || username,
      currency: "INR",
    };

    // Add security question if provided
    if (securityQuestion && securityAnswer) {
      const normalizedAnswer = securityAnswer.toLowerCase().trim();
      const hashedAnswer = await bcrypt.hash(normalizedAnswer, SALT_ROUNDS);
      userData.securityQuestion = securityQuestion;
      userData.securityAnswerHash = hashedAnswer;
      userData.hasConfiguredSecurity = true;
    }

    // Create new user
    const newUser = await User.create(userData);

    logger.info(
      `New user registered: ${username}${
        securityQuestion ? " (with security question)" : ""
      }`
    );

    return {
      id: newUser._id.toString(),
      username: newUser.username,
      name: newUser.name || username,
      currency: newUser.currency,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: { name?: string; currency?: "USD" | "INR" }
  ): Promise<AuthUser> {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    if (!updatedUser) {
      throw new Error("USER_NOT_FOUND");
    }

    logger.info(`Profile updated for user: ${updatedUser.username}`);

    return {
      id: updatedUser._id.toString(),
      username: updatedUser.username,
      name: updatedUser.name || updatedUser.username,
      currency: updatedUser.currency || "INR",
    };
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    // Validate new password length
    if (newPassword.length < 4) {
      throw new Error("PASSWORD_TOO_SHORT");
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      throw new Error("INVALID_PASSWORD");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update ONLY the password field to avoid affecting other fields
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    logger.info(`Password changed for user: ${user.username}`);

    return { message: "Password changed successfully" };
  }

  /**
   * Delete user account and all associated data
   */
  async deleteAccount(
    userId: string,
    password: string
  ): Promise<{ message: string }> {
    // Import models here to avoid circular dependencies
    const { MonthData, RecurringExpense } = await import("../models");
    const InsightsCache = (await import("../models/InsightsCache")).default;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("INVALID_PASSWORD");
    }

    const username = user.username;

    // Delete all associated data
    await Promise.all([
      MonthData.deleteMany({ userId }),
      RecurringExpense.deleteMany({ userId }),
      InsightsCache.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    logger.info(`Account deleted for user: ${username} (ID: ${userId})`);

    return { message: "Account deleted successfully" };
  }

  /**
   * Set security question for a user (initial setup)
   */
  async setSecurityQuestion(
    userId: string,
    question: string,
    answer: string
  ): Promise<{ message: string }> {
    // Validate inputs
    if (!question || !answer) {
      throw new Error("QUESTION_AND_ANSWER_REQUIRED");
    }

    if (answer.length < 3) {
      throw new Error("ANSWER_TOO_SHORT");
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Normalize and hash the answer
    const normalizedAnswer = answer.toLowerCase().trim();
    const hashedAnswer = await bcrypt.hash(normalizedAnswer, SALT_ROUNDS);

    // Update user with security question
    user.securityQuestion = question;
    user.securityAnswerHash = hashedAnswer;
    user.hasConfiguredSecurity = true;
    await user.save();

    logger.info(`Security question set for user: ${user.username}`);

    return { message: "Security question set successfully" };
  }

  /**
   * Update security question (requires current password verification)
   */
  async updateSecurityQuestion(
    userId: string,
    currentPassword: string,
    question: string,
    answer: string
  ): Promise<{ message: string }> {
    // Validate inputs
    if (!question || !answer || !currentPassword) {
      throw new Error("ALL_FIELDS_REQUIRED");
    }

    if (answer.length < 3) {
      throw new Error("ANSWER_TOO_SHORT");
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      throw new Error("INVALID_PASSWORD");
    }

    // Normalize and hash the new answer
    const normalizedAnswer = answer.toLowerCase().trim();
    const hashedAnswer = await bcrypt.hash(normalizedAnswer, SALT_ROUNDS);

    // Update security question
    user.securityQuestion = question;
    user.securityAnswerHash = hashedAnswer;
    user.hasConfiguredSecurity = true;
    await user.save();

    logger.info(`Security question updated for user: ${user.username}`);

    return { message: "Security question updated successfully" };
  }

  /**
   * Get security question for a username (public endpoint for password reset)
   */
  async getSecurityQuestion(username: string): Promise<{
    question: string | null;
    hasSecurityQuestion: boolean;
    isAdmin: boolean;
  }> {
    // Check if admin
    const isAdmin = username.toLowerCase() === "admin";

    // Find user
    const user = await User.findOne({ username });

    // Return generic response if user doesn't exist (security)
    if (!user) {
      return {
        question: null,
        hasSecurityQuestion: false,
        isAdmin,
      };
    }

    logger.info(`Security question requested for user: ${username}`);

    return {
      question: user.securityQuestion || null,
      hasSecurityQuestion: !!user.securityQuestion,
      isAdmin,
    };
  }

  /**
   * Verify security answer (internal helper)
   */
  private async verifySecurityAnswer(
    username: string,
    answer: string
  ): Promise<boolean> {
    const user = await User.findOne({ username });

    if (!user || !user.securityAnswerHash) {
      return false;
    }

    const normalizedAnswer = answer.toLowerCase().trim();
    return bcrypt.compare(normalizedAnswer, user.securityAnswerHash);
  }

  /**
   * Verify security answer for password reset (public method)
   */
  async verifySecurityAnswerForReset(
    username: string,
    securityAnswer: string
  ): Promise<{ verified: boolean }> {
    // Check if admin
    if (username.toLowerCase() === "admin") {
      throw new Error("ADMIN_PASSWORD_RESET_BLOCKED");
    }

    // Find user
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    if (!user.securityAnswerHash) {
      throw new Error("NO_SECURITY_QUESTION");
    }

    // Verify the answer
    const isValid = await this.verifySecurityAnswer(username, securityAnswer);

    if (!isValid) {
      logger.warn(`Failed security answer verification for user: ${username}`);
      throw new Error("INVALID_SECURITY_ANSWER");
    }

    logger.info(`Security answer verified for user: ${username}`);

    return { verified: true };
  }

  /**
   * Reset password using security question
   */
  async resetPasswordWithSecurity(
    username: string,
    securityAnswer: string,
    newPassword: string
  ): Promise<{ message: string }> {
    // Check if admin
    if (username.toLowerCase() === "admin") {
      throw new Error("ADMIN_PASSWORD_RESET_BLOCKED");
    }

    // Validate new password
    if (newPassword.length < 4) {
      throw new Error("PASSWORD_TOO_SHORT");
    }

    // Verify security answer
    const isValid = await this.verifySecurityAnswer(username, securityAnswer);

    if (!isValid) {
      logger.warn(`Failed password reset attempt for user: ${username}`);
      throw new Error("INVALID_SECURITY_ANSWER");
    }

    // Find user and update password
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashedPassword;
    await user.save();

    logger.info(`Password reset successfully for user: ${username}`);

    return { message: "Password reset successfully" };
  }
}

// Export singleton instance
export const authService = new AuthService();
