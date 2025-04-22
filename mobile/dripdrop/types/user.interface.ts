export interface User {
  username: string;
  email: string;
  uuid: string;
  exp: number;
  id_token: string;
  access_token: string;
  refresh_token: string;
  profilePic?: string;
  bio?: string;     // ✨ Short text description shown below username
  link?: string;    // ✨ External link (e.g. website, portfolio, etc.)
}


export interface UserContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getBearerToken: () => Promise<string>;
  loading: boolean;
}

export interface BasicUserData {
  uuid: string;
  email: string;
  username?: string;
  profilePic?: string;
}
