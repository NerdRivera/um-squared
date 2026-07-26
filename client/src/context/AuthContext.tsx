import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "../services";
import { getAccessToken } from "../services/apiClient";
import type { LoginInput, RegisterInput, User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      if (!getAccessToken()) {
        setLoading(false);
        return;
      }
      try {
        setUser(await authService.me());
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    void loadCurrentUser();
  }, []);

  async function login(input: LoginInput): Promise<void> {
    const result = await authService.login(input);
    setUser(result.user);
  }

  async function register(input: RegisterInput): Promise<void> {
    const result = await authService.register(input);
    setUser(result.user);
  }

  async function logout(): Promise<void> {
    await authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
