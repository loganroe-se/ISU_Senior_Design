import axios from "axios";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, UserContextType } from '../types'

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const signIn = async (username: string, password: string): Promise<void> => {
    try {
      const options = {
        method: "POST",
        url: "https://api.dripdropco.com/users/signIn",
        headers: { "content-type": "application/json" },
        data: { email: username, password },
      };

      const { data } = await axios.request(options);

      const signedInUser: User = {
        id: data.id,
        email: username,
        username: data.userName
      };

      setUser(signedInUser);
      sessionStorage.setItem("user", JSON.stringify(signedInUser));
    } catch (error) {
      console.error("Sign-in failed:", error);
      throw error;
    }
  };
  const signOut = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

// Export the context
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
