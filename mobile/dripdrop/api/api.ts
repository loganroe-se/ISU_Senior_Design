import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = "https://api.dripdropco.com";

// Utility function to check if the token is expired
const isTokenExpired = (exp: number): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);
  return exp < currentTime;
};

// Function to refresh tokens using the refresh_token
const refreshTokens = async (refresh_token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh tokens");
    }

    const newTokens = await response.json();

    // Update the stored user object
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);

      if(user.hasOwnProperty("id")) {
        user["uuid"] = user["id"];
        delete user["id"];

        await AsyncStorage.setItem("user", JSON.stringify(user));
      }
      const updatedUser = {
        ...user,
        id_token: newTokens.id_token,
        access_token: newTokens.access_token,
        exp: decodeTokenExpiration(newTokens.id_token), // you’ll need to decode the new token
      };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    }

    return newTokens.id_token;
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    throw error;
  }
};

// Function to decode the expiration from JWT token (basic base64 decode)
const decodeTokenExpiration = (token: string): number => {
  const payload = token.split('.')[1];
  const decoded = JSON.parse(atob(payload));
  return decoded.exp;
};

// Function to get the Bearer token
const getBearerToken = async (): Promise<string> => {
  try {
    const storedUser = await AsyncStorage.getItem("user");
    if (!storedUser) throw new Error("User not found in AsyncStorage.");

    const user = JSON.parse(storedUser);

    // If token is expired, refresh it
    if (user.exp && isTokenExpired(user.exp)) {
      console.log("id_token expired, refreshing...");
      return await refreshTokens(user.refresh_token);
    }

    return user.id_token;
  } catch (error) {
    console.error("Error getting bearer token:", error);
    throw new Error("Failed to get bearer token.");
  }
};

// Main API request function
export const apiRequest = async <T, D = unknown>(
  method: string,
  url: string,
  data: D = null as unknown as D
): Promise<T> => {
  try {
    const token = await getBearerToken();

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (method !== "GET" && data !== null) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, options);

    // Pass empty return when a 204 occurs
    if (response.status === 204) return null as T;
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error [${method.toUpperCase()} ${url}]:`, errorData);
      throw new Error(errorData?.message || "An error occurred");
    }

    return await response.json();
  } catch (error) {
    console.error(`Error [${method.toUpperCase()} ${url}]:`, error);
    throw error;
  }
};
