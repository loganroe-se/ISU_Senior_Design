import { User } from "@/types/user.interface";
import { apiRequest } from "./api";

export const fetchUsers = async (): Promise<User[] | null> => {
  return await apiRequest<User[]>("GET", "/users/");
};

// Fetch user by userID
export const fetchUserById = async (userID: string): Promise<User | null> => {
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


export const updateUser = async (userData: Partial<User>): Promise<User> => {
  if (!userData.uuid) {
    throw new Error("User ID is required to update user");
  }

  const body: Record<string, any> = {};
  if (userData.username) body.username = userData.username;
  if (userData.email) body.email = userData.email;
  if (userData.profilePic) body.profilePic = userData.profilePic;

  return await apiRequest<User, typeof body>("PUT", `/users/${userData.uuid}`, body);
};


// Delete user by userID
export const deleteUser = async (uid: String): Promise<User | null> => {
  await fetch(`https://api.dripdropco.com/users/${uid}`, {
    method: "DELETE",
  });

  return null;
};

// Fetch users by search term
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