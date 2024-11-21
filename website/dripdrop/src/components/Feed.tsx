import React, { useState, useEffect } from "react";
import { Container, Grid, CircularProgress, Typography } from "@mui/material";
import PostCard from "./PostCard";
import { retreivePost } from "../styles/types";
import { fetchPosts, fetchUserById } from "../api/api";  // Import API functions

const Feed = () => {
  const [posts, setPosts] = useState<retreivePost[]>([]);  // State for posts
  const [loading, setLoading] = useState<boolean>(true);  // State for loading
  const [error, setError] = useState<string | null>(null);  // State for error message
  const [usernamesMap, setUsernamesMap] = useState<{ [key: string]: string }>({});  // State for storing usernames
  const [usernamesLoading, setUsernamesLoading] = useState<boolean>(true);  // Loading state for usernames

  useEffect(() => {
    const loadPostsAndUsernames = async () => {
      try {
        // Fetch posts from the API
        const postsData = await fetchPosts();
        setPosts(postsData);

        // Fetch usernames for all posts concurrently (parallel fetch)
        const usernamesData = await Promise.all(
          postsData.map((post) => fetchUserById(post.userID))
        );

        // Create a mapping of post IDs to usernames
        const usernamesMap: { [key: string]: string } = {};
        postsData.forEach((post, index) => {
          const username = usernamesData[index] || "Unknown User";  // Use default if username is not found
          usernamesMap[index] = username;  // Map the post ID to the username
        });

        // Update state with the new usernames map
        setUsernamesMap(usernamesMap);
        console.log("This is the usernamesmap: " + usernamesMap);

      } catch (err) {
        setError("Failed to fetch posts");
        console.error(err);
      } finally {
        // Once everything is loaded, set loading to false
        setLoading(false);
        setUsernamesLoading(false);  // Set usernames loading state to false
      }
    };

    loadPostsAndUsernames();  // Call the function to fetch posts and usernames
  }, []);  // Empty dependency array ensures this runs only once when the component mounts

  // If we're loading, show a loading spinner
  if (loading || usernamesLoading) {
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

  // Render the posts
  return (
    <Container>
      <Grid container spacing={2}>
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post, index) => {
            const images = post.images || [];  // Default to empty array if images are undefined
            const username = usernamesMap[index] || "Loading...";  // Get username for each post

            return (
              <Grid item key={post.id} xs={12}>
                <PostCard
                  images={["/default_image.jpg"]}
                  username={username}  // Pass username to PostCard
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