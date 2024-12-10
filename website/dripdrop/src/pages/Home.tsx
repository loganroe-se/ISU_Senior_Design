import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Feed from '../components/Feed'; // Import the Feed component

export default function Home() {
  return (
    <Box
      id="feed"
      sx={{
        display: 'flex',
        maxHeight: 'auto',
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
          alignItems: 'center'
        }}
      >
        <Feed /> {/* Include the Feed component */}
      </Container>
    </Box>
  );
}
