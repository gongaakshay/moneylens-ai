import { useState, useCallback } from "react";
import { AuthUser } from "@/types";
import * as api from "@/services/api";

const USER_STORAGE_KEY = "moneylens-user";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const userData = await api.login(username, password);
        setUser(userData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        return true;
      } catch (_err) {
        setError("Invalid credentials");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (
      username: string,
      password: string,
      name?: string,
      securityQuestion?: string,
      securityAnswer?: string
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        const userData = await api.register(username, password, name, securityQuestion, securityAnswer);
        setUser(userData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        return { success: true };
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || "Registration failed";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    setUser,
  };
}

