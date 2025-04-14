import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserContextType } from "@/types/user.interface";
import { router } from "expo-router";
import { apiRequest } from "@/api/api";
import { loadUserFromStorage, decodeJWT, saveUserToStorage, getValidBearerToken, clearTokenCache } from "@/api/auth";

const USER_STORAGE_KEY = "user";
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage().then(u => {
      if (u) setUser(u);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      // ✅ Use centralized apiRequest with POST
      const data = await apiRequest<any, { email: string; password: string }>(
        "POST",
        "/users/signIn",
        { email, password },
        true
      );

      const decoded = decodeJWT(data.id_token);

      const signedInUser: User = {
        username: decoded.name,
        email: decoded.email,
        uuid: decoded.sub,
        exp: decoded.exp,
        id_token: data.id_token,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      };

      await saveUserToStorage(signedInUser);
      setUser(signedInUser);
    } catch (err) {
      console.error("Sign-in failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      setUser(null);
      clearTokenCache(); // ✅ Clear in-memory tokens
      await AsyncStorage.removeItem("user");
      router.replace("../auth/signin");
    } catch (err) {
      console.error("Sign-out failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  

  return (
    <UserContext.Provider
      value={{ user, loading, signIn, signOut, getBearerToken: getValidBearerToken }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within a UserProvider");
  return ctx;
};
