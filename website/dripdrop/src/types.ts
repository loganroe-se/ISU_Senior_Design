export type Image = {
  imageID: number;
  imageURL: string;
};

export interface sendPost {
  userID: number;
  caption: string;
  images?: string[];
}

export interface Post {
  postID: number;
  userID: number;
  images: { imageURL: string }[];
  username: string;
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

export interface Comment {
  commentID: number;
  username: number;
  postID: number;
  content: string;
  createdDate: string;
}
