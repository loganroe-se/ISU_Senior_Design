import React, { useState } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/PostCard";

const drawerWidth = 240;

export default function Home() {
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
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <Container
        component="main"
        sx={{
          justifyContent: "center",
          flexGrow: 1,
          p: 3,
          mt: 8,
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
