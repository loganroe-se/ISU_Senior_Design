export interface User {
  id: number;
  username: string;
  email: string;
}
export interface UserContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}
