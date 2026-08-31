import { env } from "../config/env";
import {
  type LoginData,
  type ApiResponse,
  type RegisterData,
  type AuthUser,
} from "./types";

const AUTH_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
} as const;

export function saveAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(AUTH_KEYS.accessToken, accessToken);
  localStorage.setItem(AUTH_KEYS.refreshToken, refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem(AUTH_KEYS.accessToken);
  localStorage.removeItem(AUTH_KEYS.refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(AUTH_KEYS.accessToken);
}

async function authRequest<T>(
  path: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    const msg =
      typeof json.message === "string"
        ? json.message
        : Array.isArray(json.message)
          ? json.message[0]
          : "REQUEST_FAILED";
    throw new Error(msg);
  }
  return json as ApiResponse<T>;
}

export async function login(email: string, password: string) {
  return authRequest<LoginData>("/auth/login", { email, password });
}

export async function register(payload: {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;
}) {
  return authRequest<RegisterData>("/auth/register", payload);
}

export async function getMe() {
  const token = localStorage.getItem(AUTH_KEYS.accessToken);
  const res = await fetch(`${env.apiBaseUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "FETCH_FAILED");
  return json as ApiResponse<AuthUser & { phone?: string; isActive: boolean }>;
}
