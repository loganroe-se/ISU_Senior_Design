import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import PostCard from '../components/PostCard';

interface Post {
  postID: number;
  userID: string | null;
  caption: string;
  createdDate: string | null;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]); // Specify the state type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Allow null values

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('https://api.dripdropco.com/posts/');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Post[] = await response.json(); // Explicitly type the data
        setPosts(data);
      } catch (err) {
        setError('Failed to fetch posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Box
      id="feed"
      sx={{
        display: 'flex',
        maxHeight: '95vh',
        overflow: 'scroll',
      }}
    >
      <CssBaseline />
      <Container
        component="main"
        sx={{
          justifyContent: 'center',
          flexGrow: 1,
          display: 'flex',
        }}
      >
        <div className="post">
          {posts.map((post, index) => (
            <PostCard
              key={post.postID || index} // Use postID if available, else use index
              image="/default_image.jpg" // Placeholder image, update if needed
              username={post.userID || 'Anonymous'} // Placeholder username
              caption={post.caption || 'No caption provided'} // Fallback for caption
            />
          ))}
        </div>
      </Container>
    </Box>
  );
}
