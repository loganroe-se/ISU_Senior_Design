
export interface User {
  username: string,
  email: string,
  uuid: string,
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

export interface NewUser {
    id: string,
    email: string,
    username: string,
    profilePic: string
}
