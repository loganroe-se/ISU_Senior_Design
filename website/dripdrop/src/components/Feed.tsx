import React, { useState, useEffect } from "react";
import { Container, Grid, CircularProgress, Typography } from "@mui/material";
import PostCard from "./PostCard";

// The interface for post data
interface Post {
  id: string;
  image: string;
  username: string;
  caption: string;
}

// A function to simulate fetching posts from the backend
const getPosts = async (): Promise<Post[]> => {
  try {
    // Example of an API request to the backend (replace with your actual API URL)
    const response = await fetch(
      "https://y02r1obse5.execute-api.us-east-1.amazonaws.com/prod/posts"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }
    const data = await response.json();
    return data.posts; // Assuming the response structure has a 'posts' array
  } catch (error) {
    console.error("Error fetching posts:", error);
    return []; // Return an empty array if there's an error
  }
};

// Feed component that fetches and displays posts
const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch posts when the component mounts
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // If we're loading, show a loading spinner
  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  // If there's an error, display an error message
  if (error) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item key={post.id} xs={12} sm={6} md={4}>
            <PostCard
              image={post.image}
              username={post.username}
              caption={post.caption}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Feed;
