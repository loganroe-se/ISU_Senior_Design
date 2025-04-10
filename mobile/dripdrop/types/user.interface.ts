
export interface User {
  username: string,
  email: string,
  id: string,
  exp: string,
  id_token: string,
  access_token: string,
  refresh_token: string
}
export interface ProfileUser extends User {
  profilePic: string;

}
export interface UserContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}
