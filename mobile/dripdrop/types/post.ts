export interface sendPost {
  uuid: string;
  caption: string;
  images?: string[];
  postID?: number;
}

export interface Post {
  postID: number;
  uuid: string;
  status: string;
  images: { imageURL: string, imageID: number }[];
  username: string;
  caption: string;
  createdDate: string;
  clothesUrl: string;
  numLikes: number;
  numComments: number;
  user: {
    username: string;
    profilePic: string;
  };
  
}

export interface FeedPost extends Post {
  username: string;
  userHasLiked: boolean;
}

export interface Marker {
  x: number;
  y: number;
}
