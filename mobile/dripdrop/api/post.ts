import { Post, sendPost } from "@/types/post";
import { apiRequest } from "./api";

// Create a new post
export const createPost = async (newPost: sendPost): Promise<sendPost> => {
  console.log("Sending post data:", newPost);
  return apiRequest<sendPost, sendPost>("POST", "/posts/", newPost);
};

// Fetch all posts
export const fetchPosts = async (): Promise<Post[]> => {
  return apiRequest<Post[]>("GET", "/posts/");
};

// Fetch all user posts
export const fetchUserPosts = async (userID: number): Promise<Post[]> => {
  return apiRequest<Post[]>("GET", `/posts/user/${userID}`);
};

//Publish a post
export const publishPost = async (postID: number): Promise<void> => {
  return apiRequest<void>("PUT", `/posts/publish/${postID}`);
};
