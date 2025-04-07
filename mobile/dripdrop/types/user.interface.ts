
export interface User {
  username: String,
  email: String,
  id: number,
  access_token: number,
  refresh_token: number
}
export interface UserProfile extends User {
  profilePic: string;

}
export interface UserContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}
