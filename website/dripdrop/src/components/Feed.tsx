import React, { useState, useEffect } from "react"; 
import { Container, Grid, CircularProgress, Typography } from "@mui/material";
import PostCard from "./PostCard";
import { fetchPosts } from "../api/api"; // Import the fetchPosts function

// The interface for post data
export interface Post {
  id: string;
  images: { imageURL: string }[]; // Array of image objects with imageURL field
  username: string;
  caption: string;
}

// Feed component that fetches and displays posts
const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts(); // Call the function from api.ts
        setPosts(data);  // Set posts state with the fetched data
      } catch (err: any) {
        setError(err.message);  // Handle error
      } finally {
        setLoading(false);  // Stop loading spinner
      }
    };

    loadPosts();  // Invoke the function to load posts
  }, []);  // Run only once when the component mounts

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
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post) => {
            // Ensure images is an array, even if it's not defined
            const images = post.images || [];  // Default to an empty array if images is undefined

            return (
              // This ensures each post spans the full width (12 columns)
              <Grid item key={post.id} xs={12}>
                <PostCard
                  images={images.length > 0 ? [images[0].imageURL] : ["/default_image.jpg"]}  // Wrap image URL in an array
                  username={post.username}
                  caption={post.caption}
                />
              </Grid>
            );
          })
        ) : (
          <Typography variant="h6" color="textSecondary">
            No posts available.
          </Typography>
        )}
      </Grid>
    </Container>
  );
};

export default Feed;