import axios from "axios";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserEmail } from "@/api/user";
import { UserContextType, User } from "@/types/types";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user data from AsyncStorage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error);
      }
    };
    loadUser();
  }, []);

  const signIn = async (username: string, password: string): Promise<void> => {
    try {
      const options = {
        method: "POST",
        url: "https://api.dripdropco.com/users/signIn",
        headers: { "content-type": "application/json" },
        data: { email: username, password },
      };

      const { data } = await axios.request(options);

      // Fetch user email using their ID
      const userWithEmail = await fetchUserEmail(data.id);

      const signedInUser: User = {
        id: data.id,
        username: data.username,
        email: userWithEmail ?? "",
      };

      setUser(signedInUser);
      await AsyncStorage.setItem("user", JSON.stringify(signedInUser));
      
    } catch (error) {
      console.error("Sign-in failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
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
