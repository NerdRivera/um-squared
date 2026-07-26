import apiClient, { clearTokens, getRefreshToken, setTokens } from "./apiClient";
import type { AuthResponse, LoginInput, RegisterInput, User } from "../types";

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", input);
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", input);
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function me(): Promise<User> {
  const { data } = await apiClient.get<{ user: User }>("/auth/me");
  return data.user;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await apiClient.post("/auth/logout", { refreshToken });
    }
  } finally {
    clearTokens();
  }
}
