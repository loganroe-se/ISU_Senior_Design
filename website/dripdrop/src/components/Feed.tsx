import React, { useState, useEffect } from 'react';
import { Container, Grid, CircularProgress, Typography, Box } from '@mui/material';
import PostCard from './PostCard';
import { fetchUserById, fetchPosts } from '../api/api'; // Import API functions
import { Post } from '../types';
import { v4 as uuidv4 } from 'uuid';
import ViewPostModal from './ViewPostModal';

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]); // State for posts
  const [selectedPost, setSelectedPost] = useState<{
    postID: number;
    userID: number;
    caption: string;
    createdDate: string;
    images: { imageID: number; imageURL: string }[];
  } | null>(null); // State for selected post with correct type
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const [error, setError] = useState<string | null>(null); // State for error message
  const [usernamesMap, setUsernamesMap] = useState<{ [key: string]: string }>({}); // State for storing usernames
  const [usernamesLoading, setUsernamesLoading] = useState<boolean>(true); // Loading state for usernames

  const handlePostClick = (post: Post) => {
    // Set the selected post for the modal
    setSelectedPost({
      postID: post.postID,
      userID: post.userID,
      caption: post.caption,
      createdDate: post.createdDate,
      images: post.images.map((image, index) => ({
        imageID: index,
        imageURL: image.imageURL,
      })),
    });
  };

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
          const username = usernamesData[index] || 'Unknown User';
          usernamesMap[index] = username;
        });

        setUsernamesMap(usernamesMap);
      } catch (err) {
        setError('Failed to fetch posts');
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
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
    <Box
      sx={{
        marginTop: '2rem', // Adds spacing from the top
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center aligns the feed
      }}
    >
      <Grid container spacing={3} justifyContent="center">
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post, index) => {
            console.log('Post ARRAY:', post.postID);

            const imageURL =
              Array.isArray(post.images) && post.images.length > 0 && post.images[0].imageURL
                ? `https://cdn.dripdropco.com/${post.images[0].imageURL}?format=png`
                : 'default_image.png';

            const username = usernamesMap[index] || 'Loading...';

            return (
              <Grid item key={uuidv4()} xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center', // Centers the post card
                  }}
                >
                  <PostCard
                    images={imageURL}
                    username={username}
                    caption={post.caption}
                    onPostClick={handlePostClick} // Pass the function as a prop
                    post={post}
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
      <ViewPostModal selectedPost={selectedPost} onClose={() => setSelectedPost(null)} />
    </Box>
  );
};

export default Feed;
