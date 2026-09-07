import { Router, Request, Response } from "express";
import { authService } from "../services";
import { logger } from "../config/logger";

const router = Router();

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  name?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

interface UpdateProfileRequest {
  userId: string;
  name?: string;
  currency?: "USD" | "INR";
}

interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

interface DeleteAccountRequest {
  userId: string;
  password: string;
}

interface SetSecurityQuestionRequest {
  userId: string;
  question: string;
  answer: string;
}

interface UpdateSecurityQuestionRequest {
  userId: string;
  currentPassword: string;
  question: string;
  answer: string;
}

interface ResetPasswordSecurityRequest {
  username: string;
  securityAnswer: string;
  newPassword: string;
}

interface VerifySecurityAnswerRequest {
  username: string;
  securityAnswer: string;
}

router.post(
  "/login",
  async (req: Request<object, object, LoginRequest>, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    try {
      const user = await authService.login(username, password);
      res.json(user);
    } catch (error: any) {
      if (error.message === "INVALID_CREDENTIALS") {
        res.status(401).json({ error: "Invalid username or password" });
      } else {
        logger.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.post(
  "/register",
  async (req: Request<object, object, RegisterRequest>, res: Response) => {
    const { username, password, name, securityQuestion, securityAnswer } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    try {
      const user = await authService.register(username, password, name, securityQuestion, securityAnswer);
      res.status(201).json(user);
    } catch (error: any) {
      if (error.message === "USERNAME_TOO_SHORT") {
        res.status(400).json({ error: "Username must be at least 3 characters" });
      } else if (error.message === "PASSWORD_TOO_SHORT") {
        res.status(400).json({ error: "Password must be at least 4 characters" });
      } else if (error.message === "USERNAME_EXISTS") {
        res.status(400).json({ error: "Username already exists" });
      } else if (error.message === "ANSWER_TOO_SHORT") {
        res.status(400).json({ error: "Security answer must be at least 3 characters" });
      } else {
        logger.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.put(
  "/profile",
  async (req: Request<object, object, UpdateProfileRequest>, res: Response) => {
    const { userId, name, currency } = req.body;

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    try {
      const user = await authService.updateProfile(userId, { name, currency });
      res.json(user);
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        res.status(404).json({ error: "User not found" });
      } else {
        logger.error("Profile update error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.post(
  "/change-password",
  async (req: Request<object, object, ChangePasswordRequest>, res: Response) => {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      res.status(400).json({ error: "User ID, current password, and new password are required" });
      return;
    }

    try {
      const result = await authService.changePassword(userId, currentPassword, newPassword);
      res.json(result);
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        res.status(404).json({ error: "User not found" });
      } else if (error.message === "INVALID_PASSWORD") {
        res.status(401).json({ error: "Current password is incorrect" });
      } else if (error.message === "PASSWORD_TOO_SHORT") {
        res.status(400).json({ error: "New password must be at least 4 characters" });
      } else {
        logger.error("Password change error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.delete(
  "/account",
  async (req: Request<object, object, DeleteAccountRequest>, res: Response) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
      res.status(400).json({ error: "User ID and password are required" });
      return;
    }

    try {
      const result = await authService.deleteAccount(userId, password);
      res.json(result);
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        res.status(404).json({ error: "User not found" });
      } else if (error.message === "INVALID_PASSWORD") {
        res.status(401).json({ error: "Password is incorrect" });
      } else {
        logger.error("Account deletion error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

// Security Question Routes

router.post(
  "/security-question",
  async (req: Request<object, object, SetSecurityQuestionRequest>, res: Response) => {
    const { userId, question, answer } = req.body;

    if (!userId || !question || !answer) {
      res.status(400).json({ error: "User ID, question, and answer are required" });
      return;
    }

    try {
      const result = await authService.setSecurityQuestion(userId, question, answer);
      res.json(result);
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        res.status(404).json({ error: "User not found" });
      } else if (error.message === "ANSWER_TOO_SHORT") {
        res.status(400).json({ error: "Answer must be at least 3 characters" });
      } else if (error.message === "QUESTION_AND_ANSWER_REQUIRED") {
        res.status(400).json({ error: "Question and answer are required" });
      } else {
        logger.error("Set security question error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.put(
  "/security-question",
  async (req: Request<object, object, UpdateSecurityQuestionRequest>, res: Response) => {
    const { userId, currentPassword, question, answer } = req.body;

    if (!userId || !currentPassword || !question || !answer) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    try {
      const result = await authService.updateSecurityQuestion(
        userId,
        currentPassword,
        question,
        answer
      );
      res.json(result);
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        res.status(404).json({ error: "User not found" });
      } else if (error.message === "INVALID_PASSWORD") {
        res.status(401).json({ error: "Current password is incorrect" });
      } else if (error.message === "ANSWER_TOO_SHORT") {
        res.status(400).json({ error: "Answer must be at least 3 characters" });
      } else if (error.message === "ALL_FIELDS_REQUIRED") {
        res.status(400).json({ error: "All fields are required" });
      } else {
        logger.error("Update security question error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.get(
  "/security-question/:username",
  async (req: Request, res: Response) => {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ error: "Username is required" });
      return;
    }

    try {
      const result = await authService.getSecurityQuestion(username);
      res.json(result);
    } catch (error: any) {
      logger.error("Get security question error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/reset-password-security",
  async (req: Request<object, object, ResetPasswordSecurityRequest>, res: Response) => {
    const { username, securityAnswer, newPassword } = req.body;

    if (!username || !securityAnswer || !newPassword) {
      res.status(400).json({ error: "Username, security answer, and new password are required" });
      return;
    }

    try {
      const result = await authService.resetPasswordWithSecurity(
        username,
        securityAnswer,
        newPassword
      );
      res.json(result);
    } catch (error: any) {
      if (error.message === "ADMIN_PASSWORD_RESET_BLOCKED") {
        res.status(403).json({ error: "Password reset is not available for the admin account" });
      } else if (error.message === "INVALID_SECURITY_ANSWER") {
        res.status(401).json({ error: "Invalid security answer" });
      } else if (error.message === "PASSWORD_TOO_SHORT") {
        res.status(400).json({ error: "New password must be at least 4 characters" });
      } else if (error.message === "USER_NOT_FOUND") {
        res.status(404).json({ error: "User not found" });
      } else {
        logger.error("Password reset error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.post(
  "/verify-security-answer",
  async (req: Request<object, object, VerifySecurityAnswerRequest>, res: Response) => {
    const { username, securityAnswer } = req.body;

    if (!username || !securityAnswer) {
      res.status(400).json({ error: "Username and security answer are required" });
      return;
    }

    try {
      const result = await authService.verifySecurityAnswerForReset(
        username,
        securityAnswer
      );
      res.json(result);
    } catch (error: any) {
      if (error.message === "ADMIN_PASSWORD_RESET_BLOCKED") {
        res.status(403).json({ error: "Password reset is not available for the admin account" });
      } else if (error.message === "INVALID_SECURITY_ANSWER") {
        res.status(401).json({ error: "Invalid security answer" });
      } else if (error.message === "USER_NOT_FOUND") {
        res.status(404).json({ error: "User not found" });
      } else if (error.message === "NO_SECURITY_QUESTION") {
        res.status(400).json({ error: "No security question found for this user" });
      } else {
        logger.error("Verify security answer error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

export default router;
