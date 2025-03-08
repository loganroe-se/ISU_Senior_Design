const API_BASE_URL = "https://api.dripdropco.com";

export const apiRequest = async <T, D = unknown>(
  method: string,
  url: string,
  data: D = null as unknown as D
): Promise<T> => {
  try {
    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    // Only include body if it's not a GET request
    if (method !== "GET" && data !== null) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, options);

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
