import { User } from "@/types/user";
import { apiRequest } from "./api";

export const fetchUsers = async (): Promise<User[] | null> => {
  return await apiRequest<User[]>("GET", "/users/");
};

// Fetch user by userID
export const fetchUserById = async (userID: number): Promise<User | null> => {
  return apiRequest<User | null>("GET", `/users/${userID}`);
};

// Fetch user email by userID
export const fetchUserEmail = async (
  userID: number
): Promise<string | null> => {
  const user = await apiRequest<User>("GET", `/users/${userID}`);
  return user ? user.email : null;
};
