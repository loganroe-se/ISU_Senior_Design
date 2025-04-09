import { Post, sendPost } from "@/types/post";
import { apiRequest } from "./api";

// Create a new post
export const createPost = async (newPost: sendPost): Promise<sendPost> => {
  console.log("Sending post data:", newPost);
  const response = await apiRequest<string, sendPost>(
    "POST",
    "/posts/",
    newPost
  );

  // Parse the string response to extract postID
  const postIdMatch = response.match(/postID: (\d+)/);
  const postId = postIdMatch ? parseInt(postIdMatch[1]) : undefined;

  return {
    ...newPost,
    postID: postId,
  };
};

// Fetch all posts
export const fetchPosts = async (): Promise<Post[]> => {
  return apiRequest<Post[]>("GET", "/posts/");
};

export const getPostById = async (postId: number): Promise<Post> => {
  return apiRequest<Post>("GET", `/posts/${postId}`);
};

// Fetch all user posts
export const fetchUserPosts = async (userID: String): Promise<Post[]> => {
  return apiRequest<Post[]>("GET", `/posts/user/${userID}`);
};

//Publish a post
export const publishPost = async (postID: number): Promise<void> => {
  return apiRequest<void>("PUT", `/posts/publish/${postID}`);
};
