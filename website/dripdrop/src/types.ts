export interface sendPost {
    userID: number; // Added userID to associate with user data
    caption: string;
    images?: string[];
  }


export interface retreivePost {
  id: number;            // Post ID
  userID: number;        // User ID
  caption: string;       // Post caption
  clothesUrl: string;    // URL for the clothes (assuming this is needed)
  images: {              // Array of image objects, each containing an image URL
    imageID: number;
    imageURL: string;
  }[];                   // Array of image objects (instead of just a string array)
}

