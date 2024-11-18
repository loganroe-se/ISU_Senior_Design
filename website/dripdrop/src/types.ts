export interface Post {
    id: string;
    userID: number; // Added userID to associate with user data
    images: { imageURL: string }[]; // Array of image objects with imageURL field
    username?: string;  // Optional field, we'll populate this later
    caption: string;
  }