import { Post, sendPost } from "@/types/post";
import { apiRequest } from "./api";
import { fetchUserById } from "./user";

// Create a new post
export const createPost = async (newPost: sendPost): Promise<sendPost> => {
  console.log("Sending post data:", newPost);
  const response = await apiRequest<string, sendPost>("POST", "/posts/", newPost);

  const postIdMatch = response.match(/postID: (\d+)/);
  const postID = postIdMatch ? parseInt(postIdMatch[1]) : undefined;

  return {
    ...newPost,
    postID,
  };
};

// Fetch all posts
export const fetchPosts = async (): Promise<Post[]> => {
  return apiRequest<Post[]>("GET", "/posts/");
};

export const getPostById = async (postId: number): Promise<Post> => {
  return apiRequest<Post>("GET", `/posts/${postId}`);
};

export const fetchUserPosts = async (userID: string, status: string): Promise<Post[]> => {
  return apiRequest<Post[]>("GET", `/posts/user/${userID}?status=${status}`);
};

// Publish a post
export const publishPost = async (postID: number): Promise<void> => {
  return apiRequest<void>("PUT", `/posts/publish/${postID}`);
};

// Search posts by search term and enrich with username
export const searchPostsByTerm = async (searchTerm: string): Promise<Post[]> => {
  try {
    const posts = await apiRequest<Post[]>("GET", `/posts/search/${searchTerm}`);

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const user = await fetchUserById(String(post.uuid));
        return {
          ...post,
          username: user?.username || "Unknown",
        };
      })
    );

    return enrichedPosts;
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
};

// Get AI Recommendations
export const getAIRecommendations = async (clothingItemID: number): Promise<Post[]> => {
  return apiRequest<Post[]>("GET", `/posts/ai-recommendations/${clothingItemID}`);
};