
export interface User {
  username: String,
  email: String,
  id: String,
  exp: String,
  id_token: String,
  access_token: String,
  refresh_token: String
}
export interface UserProfile extends User {
  profilePic: String;

}
export interface UserContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}
