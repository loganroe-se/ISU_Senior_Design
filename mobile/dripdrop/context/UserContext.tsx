import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User,  UserContextType } from "@/types/user.interface";
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
  

  const signIn = useCallback(async (userEmail: string, password: string): Promise<void> => {
    try {
      setLoading(true);

      const response = await fetch("https://api.dripdropco.com/users/signIn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sign-in failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const { name, email, sub, exp} = decodeJWT(data.id_token).payload;

      const signedInUser: User = {
        username: name,
        email: email,
        id: sub,
        exp: exp,
        id_token: data.id_token,
        access_token: data.access_token,
        refresh_token: data.refresh_token
      };
      console.log(exp);

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
  const decodeJWT = (token: string) => {
    const [header, payload, signature] = token.split('.');
  
    // Decode the base64 URL safe encoded header and payload
    const decodedHeader = JSON.parse(atob(header.replace(/_/g, '/').replace(/-/g, '+')));
    const decodedPayload = JSON.parse(atob(payload.replace(/_/g, '/').replace(/-/g, '+')));
  
    return { header: decodedHeader, payload: decodedPayload };
  };

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
