import { Post } from "../components/Feed";
// api.ts
export const fetchPosts = async (): Promise<Post[]> => {
    try {
      const response = await fetch('https://api.dripdropco.com/posts/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: Post[] = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Failed to fetch posts: " + error.message);
      } else {
        throw new Error("An unknown error occurred while fetching posts.");
      }
    }
  };