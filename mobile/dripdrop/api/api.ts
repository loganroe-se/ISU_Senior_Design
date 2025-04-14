import { getValidBearerToken } from "./auth";

const API_BASE_URL = "https://api.dripdropco.com";

export const apiRequest = async <T, D = unknown>(
  method: string,
  url: string,
  data?: D,
  skipToken: boolean = false
): Promise<T> => {
  try {
    // Only get the token if it's not skipped
    const token = skipToken ? null : await getValidBearerToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const options: RequestInit = {
      method,
      headers,
      ...(method !== "GET" && data && { body: JSON.stringify(data) }),
    };

    const response = await fetch(`${API_BASE_URL}${url}`, options);

    if (response.status === 204) return null as T;

    const result = await response.json();
    if (!response.ok) throw new Error(result?.message || "API Error");

    return result;
  } catch (error) {
    console.error(`API Error [${method} ${url}]:`, error);
    throw error;
  }
};
