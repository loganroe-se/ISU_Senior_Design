export interface User {
  id: number;
  username: string;
  email: string;
  profilePic: string;
}
export interface UserTokens {
  name: String,
  email: String,
  id: String,
  access_token: number,
  refresh_token: number
}
export interface UserContextType {
  user: UserTokens | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}
