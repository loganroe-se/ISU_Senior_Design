export interface sendPost {
  userID: number;
  caption: string;
  images?: string[];
  postID?: number;
}

export interface Post {
  postID: number;
  userID: number;
  status: string;
  images: { imageURL: string, imageID: number }[];
  username: string;
  caption: string;
  createdDate: string;
  clothesUrl: string;
  numLikes: number;
  numComments: number;
}

export interface FeedPost extends Post {
  username: string;
  userHasLiked: boolean;
}

export interface Marker {
  x: number;
  y: number;
}
