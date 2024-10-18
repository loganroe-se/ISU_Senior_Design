import React, { useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';

import Filter from '../components/Filters'; 

export default function Home() {

  const [isFilterOpen, setFilterOpen] = useState(false);

  // Function to toggle filter visibility
  const toggleFilter = (open: boolean) => () => {
    setFilterOpen(open);
  };

  const posts = [
    {
      image: "/outfit_1.jpg",
      username: "EliseTravers",
      caption: "New fall outfit!",
    },
    {
      image: "/outfit_2.jpeg",
      username: "JohnDoe",
      caption: "Ready for winter!",
    },
  
  ];

  return (
    <Box id="feed" sx={{
      display: "flex",
      maxHeight: "95vh",
      overflow: "scroll"
    }}>
      <CssBaseline />

      <Container
        component="main"
        sx={{
          justifyContent: "center",
          flexGrow: 1,
          display: "flex"
        }}
      >
        <div className="post">
          {posts.map((post, index) => (
            <PostCard
              key={index}
              image={post.image}
              username={post.username}
              caption={post.caption}
            />
          ))}
        </div>
      </Container>


    </Box>
  );
}
