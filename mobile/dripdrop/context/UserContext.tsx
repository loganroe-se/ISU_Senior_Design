import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserEmail } from "@/api/user";
import { User, UserContextType } from "@/types/user.interface";
import { router } from "expo-router";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = useCallback(async (username: string, password: string): Promise<void> => {
    try {
      setLoading(true);

      const response = await fetch("https://api.dripdropco.com/users/signIn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sign-in failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
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
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setUser(null);
      await AsyncStorage.removeItem("user");
      router.replace("/auth/signin");
    } catch (error) {
      console.error("Sign-out failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, signIn, signOut, loading }}>
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
