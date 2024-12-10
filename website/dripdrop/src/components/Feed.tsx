import { useState, useEffect } from "react";
import { Container, Grid, CircularProgress, Typography, Box } from "@mui/material";
import PostCard from "./PostCard";
import { fetchPosts, fetchUserById } from "../api/api";  // Import API functions
import { retreivePost } from "../types";

const Feed = () => {
  const [posts, setPosts] = useState<retreivePost[]>([]);  // State for posts
  const [loading, setLoading] = useState<boolean>(true);  // State for loading
  const [error, setError] = useState<string | null>(null);  // State for error message
  const [usernamesMap, setUsernamesMap] = useState<{ [key: string]: string }>({});  // State for storing usernames
  const [usernamesLoading, setUsernamesLoading] = useState<boolean>(true);  // Loading state for usernames

  useEffect(() => {
    const loadPostsAndUsernames = async () => {
      try {
        const postsData = await fetchPosts();
        setPosts(postsData);

        const usernamesData = await Promise.all(
          postsData.map((post) => fetchUserById(post.userID))
        );

        const usernamesMap: { [key: string]: string } = {};
        postsData.forEach((post, index) => {
          const username = usernamesData[index] || "Unknown User";
          usernamesMap[index] = username;
        });

        setUsernamesMap(usernamesMap);
      } catch (err) {
        setError("Failed to fetch posts");
        console.error(err);
      } finally {
        setLoading(false);
        setUsernamesLoading(false);
      }
    };

    loadPostsAndUsernames();
  }, []);

  if (loading || usernamesLoading) {
    return (
      <Container>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

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
      <Box
        sx={{
          marginTop: "2rem", // Adds spacing from the top
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // Center aligns the feed
        }}
      >
        <Grid container spacing={3} justifyContent="center">
          {Array.isArray(posts) && posts.length > 0 ? (
            posts.map((post, index) => {
              const imageURL =
                Array.isArray(post.images) &&
                  post.images.length > 0 &&
                  post.images[0].imageURL
                  ? `https://cdn.dripdropco.com/${post.images[0].imageURL}?format=png`
                  : "/default_image.png";

              const username = usernamesMap[index] || "Loading...";

              return (
                <Grid item key={post.id} xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center", // Centers the post card
                    }}
                  >
                    <PostCard
                      images={imageURL}
                      username={username}
                      caption={post.caption}
                    />
                  </Box>
                </Grid>
              );
            })
          ) : (
            <Typography variant="h6" color="textSecondary">
              No posts available.
            </Typography>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default Feed;
