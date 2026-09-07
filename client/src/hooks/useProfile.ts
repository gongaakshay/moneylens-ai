import { useState, useCallback } from "react";
import { AuthUser } from "@/types";
import * as api from "@/services/api";
import { toast } from "sonner";

const USER_STORAGE_KEY = "moneylens-user";

export function useProfile(user: AuthUser | null, setUser: (user: AuthUser) => void) {
  const [isLoading, setIsLoading] = useState(false);

  const updateProfile = useCallback(
    async (name?: string, currency?: "USD" | "INR") => {
      if (!user) return;
      setIsLoading(true);
      try {
        const updatedUser = await api.updateProfile(user.id, name, currency);
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      } finally {
        setIsLoading(false);
      }
    },
    [user, setUser]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user) return;
      try {
        await api.changePassword(user.id, currentPassword, newPassword);
        toast.success("Password changed successfully");
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error || "Failed to change password";
        toast.error(errorMsg);
        throw err;
      }
    },
    [user]
  );

  const deleteAccount = useCallback(
    async (password: string, onLogout: () => void) => {
      if (!user) return;
      try {
        await api.deleteAccount(user.id, password);
        toast.success("Account deleted successfully");
        onLogout();
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error || "Failed to delete account";
        toast.error(errorMsg);
        throw err;
      }
    },
    [user]
  );

  const setSecurityQuestion = useCallback(
    async (question: string, answer: string) => {
      if (!user) return;
      try {
        await api.setSecurityQuestion(user.id, question, answer);
        toast.success("Security question set successfully");
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error || "Failed to set security question";
        toast.error(errorMsg);
        throw err;
      }
    },
    [user]
  );

  const updateSecurityQuestion = useCallback(
    async (currentPassword: string, question: string, answer: string) => {
      if (!user) return;
      try {
        await api.updateSecurityQuestion(
          user.id,
          currentPassword,
          question,
          answer
        );
        toast.success("Security question updated successfully");
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error || "Failed to update security question";
        toast.error(errorMsg);
        throw err;
      }
    },
    [user]
  );

  return {
    isLoading,
    updateProfile,
    changePassword,
    deleteAccount,
    setSecurityQuestion,
    updateSecurityQuestion,
  };
}

