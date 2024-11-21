import { Post } from "../types";  // Ensure the Post type is correctly imported

// Fetch all posts
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch("https://api.dripdropco.com/posts/");
    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }
    const data: Post[] = await response.json();  // Cast the response to an array of posts
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch posts:", error.message);
      throw error;  // Re-throw the error to handle it in the calling component
    }
    throw new Error("Unknown error occurred while fetching posts");
  }
};

// Fetch user by userID to get the username
export const fetchUserById = async (userID: number): Promise<string | null> => {
  try {
    const response = await fetch(`https://api.dripdropco.com/users/${userID}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    const userData = await response.json();
    return userData.username;  // Return the username
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;  // Return null if user fetching fails
  }
};

// Create a new post
export const createPost = async (newPost: Post): Promise<Post> => {
  try {
    const response = await fetch("https://api.dripdropco.com/posts/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPost),  // Send the new post as JSON
    });

    if (!response.ok) {
      throw new Error("Failed to create post");
    }

    const createdPost: Post = await response.json();
    return createdPost;  // Return the newly created post
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;  // Re-throw the error to be handled in the calling component
  }
};