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

export const updatePost = async (postData: Partial<Post>): Promise<Post> => {
  if (!postData.uuid) {
    throw new Error("Post ID is required to update post");
  }

  const body: Record<string, any> = {};
  if (postData.caption) body.caption = postData.caption;
  if (postData.status) body.status = postData.status;

  return await apiRequest<Post, typeof body>("PUT", `/posts/${postData.postID}`, body);
};

// Fetch all posts
export const fetchPosts = async (): Promise<Post[]> => {
  return apiRequest<Post[]>("GET", "/posts/");
};

export const getPostById = async (postId: number): Promise<Post> => {
  return apiRequest<Post>("GET", `/posts/${postId}`);
};

// Fetch all user posts
export const fetchUserPosts = async (userID: string, status: string): Promise<Post[]> => {
  return apiRequest<Post[]>("GET", `/posts/user/${userID}?status=${status}`);
};

//Publish a post
export const publishPost = async (postID: number): Promise<void> => {
  return apiRequest<void>("PUT", `/posts/publish/${postID}`);
};
