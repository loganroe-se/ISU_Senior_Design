// auth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/user.interface";

const USER_KEY = "user";
const API_BASE_URL = "https://api.dripdropco.com";

// In-memory cache
let cachedToken: string | null = null;
let cachedExp: number | null = null;
let cachedRefreshToken: string | null = null;

export const clearTokenCache = () => {
  cachedToken = null;
  cachedExp = null;
  cachedRefreshToken = null;
};

export const decodeJWT = (token: string) => {
  const [, payload] = token.split(".");
  try {
    return JSON.parse(atob(payload.replace(/_/g, "/").replace(/-/g, "+")));
  } catch {
    return {};
  }
};

export const isTokenExpired = (exp: number) =>
  exp < Math.floor(Date.now() / 1000);

export const loadUserFromStorage = async (): Promise<User | null> => {
  const stored = await AsyncStorage.getItem(USER_KEY);
  if (!stored) return null;

  const user = JSON.parse(stored) as User;
  cachedToken = user.id_token;
  cachedExp = user.exp;
  cachedRefreshToken = user.refresh_token;
  return user;
};

export const saveUserToStorage = async (user: User) => {
  cachedToken = user.id_token;
  cachedExp = user.exp;
  cachedRefreshToken = user.refresh_token;
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const refreshTokens = async (
  refresh_token: string,
  retry = true
): Promise<string> => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    });

    if (!res.ok) throw new Error("Refresh failed");

    const tokens = await res.json();
    const decoded = decodeJWT(tokens.id_token);

    const currentUser = (await loadUserFromStorage())!;
    const updatedUser: User = {
      ...currentUser,
      id_token: tokens.id_token,
      access_token: tokens.access_token,
      exp: decoded.exp,
    };

    await saveUserToStorage(updatedUser);
    return tokens.id_token;
  } catch (err) {
    if (retry) return refreshTokens(refresh_token, false);
    throw err;
  }
};

export const getValidBearerToken = async (): Promise<string> => {
  if (!cachedToken || !cachedExp || !cachedRefreshToken) {
    await loadUserFromStorage();
  }

  if (!cachedToken || !cachedExp || !cachedRefreshToken) {
    throw new Error("No tokens available");
  }

  return isTokenExpired(cachedExp)
    ? await refreshTokens(cachedRefreshToken)
    : cachedToken;
};
