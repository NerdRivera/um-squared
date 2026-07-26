import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const ACCESS_TOKEN_KEY = "um2_access_token";
const REFRESH_TOKEN_KEY = "um2_refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const baseURL = import.meta.env.VITE_API_BASE_URL || "";

const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let pendingRefresh: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  const response = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${baseURL}/auth/refresh`,
    { refreshToken }
  );
  setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data.accessToken;
}

// The access-token middleware (src/middleware/auth.ts) returns 403 with this
// exact message for an invalid/expired token, distinct from the 403s thrown
// by role-based ForbiddenErrors (which have a JSON `code` field instead).
const EXPIRED_TOKEN_MESSAGE = "Invalid or expired token";

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string }>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isExpiredToken =
      error.response?.status === 403 &&
      error.response.data?.error === EXPIRED_TOKEN_MESSAGE;

    if (isExpiredToken && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        pendingRefresh ??= refreshAccessToken().finally(() => {
          pendingRefresh = null;
        });
        const newAccessToken = await pendingRefresh;
        originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
        return apiClient(originalRequest);
      } catch {
        clearTokens();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
