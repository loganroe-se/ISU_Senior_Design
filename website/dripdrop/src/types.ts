export type Image = {
  imageID: number;
  imageURL: string;
};

export interface sendPost {
  userID: number; // Added userID to associate with user data
  caption: string;
  images?: string[];
}

export interface retreivePost {
  id: number; // Post ID
  userID: number; // User ID
  caption: string; // Post caption
  clothesUrl: string; // URL for the clothes (assuming this is needed)
  postedDate: String;
  images: {
    // Array of image objects, each containing an image URL
    imageID: number;
    imageURL: string;
  }[]; // Array of image objects (instead of just a string array)
}

export interface Post {
  id: string;
  userID: number; // Added userID to associate with user data
  images: { imageURL: string }[]; // Array of image objects with imageURL field
  username?: string; // Optional field, we'll populate this later
  caption: string;
  postedDate: String;
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
