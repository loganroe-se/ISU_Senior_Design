import { User, ProfileUser } from "@/types/user.interface";
import { apiRequest } from "./api";

export const fetchUsers = async (): Promise<User[] | null> => {
  return await apiRequest<User[]>("GET", "/users/");
};

export const fetchUserById = async (userID: string): Promise<ProfileUser | null> => {
  return apiRequest<ProfileUser | null>("GET", `/users/${userID}`);
};

export const searchUsersByUsername = async (searchTerm: string): Promise<User[] | []> => {
  return apiRequest<User[] | []>("GET", `/users/search/${searchTerm}`);
};

export const fetchUserEmail = async (userID: number): Promise<string | null> => {
  const user = await apiRequest<User>("GET", `/users/${userID}`);
  return user ? user.email : null;
};

export const updateUser = async (userData: Partial<User>): Promise<User | null> => {
  let body = {
    username: userData.username,
    email: userData.email,
  };

  await fetch(`https://api.dripdropco.com/users/${userData.uuid}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  return null;
};

export const deleteUser = async (uid: String): Promise<User | null> => {
  await fetch(`https://api.dripdropco.com/users/${uid}`, {
    method: "DELETE",
  });

  return null;
};

export const searchUsers = async (searchTerm: string): Promise<User[] | null> => {
  try {
    const response = await fetch(
      `https://api.dripdropco.com/users/search/${searchTerm}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
