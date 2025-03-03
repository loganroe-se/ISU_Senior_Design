import axios from 'axios';

const API_BASE_URL = 'https://api.dripdropco.com';

export const apiRequest = async <T, D = unknown>(
  method: string,
  url: string,
  data: D = null as unknown as D
): Promise<T> => {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${url}`,
      headers: { 'Content-Type': 'application/json' },
      data,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Error [${method.toUpperCase()} ${url}]:`, error.response.data);
      throw new Error(error.response.data?.message || 'An error occurred');
    }
    console.error(`Error [${method.toUpperCase()} ${url}]:`, error);
    throw new Error('An unknown error occurred');
  }
};
