import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = "https://api.dripdropco.com";

// Utility function to check if the token is expired
const isTokenExpired = (exp: number): boolean => {
  const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
  return exp < currentTime;
};

// Function to get the Bearer token
const getBearerToken = async (): Promise<string> => {
  try {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);

      // If id_token is expired, use refresh_token instead
      if (user.exp && isTokenExpired(user.exp)) {
        console.log("id_token expired, using refresh_token...");
        return user.refresh_token; // Use the refresh_token directly
      }

      // Otherwise, return the valid id_token
      return user.id_token;
    }

    throw new Error("User not found in AsyncStorage.");
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
    const token = await getBearerToken(); // Get the valid Bearer token (either id_token or refresh_token)

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add Bearer token to the headers
      },
    };

    // Only include body if it's not a GET request
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
    throw new Error("An unknown error occurred");
  }
};
