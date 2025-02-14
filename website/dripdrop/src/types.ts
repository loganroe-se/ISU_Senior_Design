export type Image = {
  imageID: number;
  imageURL: string;
};

export interface sendPost {
  userID: number; // Added userID to associate with user data
  caption: string;
  images?: string[];
}

export interface Post {
  postID: number;
  userID: number; // Added userID to associate with user data
  images: { imageURL: string }[]; // Array of image objects with imageURL field
  username: string; // Optional field, we'll populate this later
  caption: string;
  createdDate: string;
  clothesUrl: string;
  numLikes: number;
}

export interface Following {
  userID: number;
  username: string;
  email: string;
}

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

export interface Marker {
  x: number;
  y: number;
}
