import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Feed from '../components/Feed'; // Import the Feed component

export default function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        maxHeight: 'auto',
        overflow: 'scroll',
        scrollbarWidth: 'none'
      }}
    >    
 
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
