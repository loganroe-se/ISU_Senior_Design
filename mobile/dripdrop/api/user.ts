import { User } from "@/types/user";
import { apiRequest } from "./api";

export const fetchUsers = async (): Promise<User[] | null> => {
  return await apiRequest<User[]>("GET", "/users/");
};

// Fetch user by userID
export const fetchUserById = async (userID: number | string): Promise<User | null> => {
  return apiRequest<User | null>("GET", `/users/${userID}`);
};

// Search users by username
export const searchUsersByUsername = async (searchTerm: string): Promise<User[] | []> => {
  return apiRequest<User[] | []>("GET", `/users/search/${searchTerm}`);
};

// Fetch user email by userID
export const fetchUserEmail = async (
  userID: number
): Promise<string | null> => {
  const user = await apiRequest<User>("GET", `/users/${userID}`);
  return user ? user.email : null;
};

// Update user by userID
export const updateUser = async (userData: Partial<User>): Promise<User | null> => {
  //Build request body
  let body = {
    "username": userData.username,
    "email": userData.email
  }
  
  await fetch(`https://api.dripdropco.com/users/${userData.id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  return null;
};

// Delete user by userID
export const deleteUser = async (uid: number): Promise<User | null> => {
  await fetch(`https://api.dripdropco.com/users/${uid}`, {
    method: "DELETE",
  });

  return null;
};