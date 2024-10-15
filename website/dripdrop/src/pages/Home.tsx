import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Post1 from '../components/Post1';
import Post2 from '../components/Post2';




const drawerWidth = 240;

export default function Home() {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <Container
                component="main"
                sx={{
                    display: 'flex', // Enable flexbox for side-by-side layout
                    justifyContent: 'space-between', // Space between posts and filter
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                }}
            >
                <Box sx={{ flexGrow: 1 }}> {/* Container for posts */}
                    <Post1 />
                    <Post2 />
                </Box>
            </Container>
        </Box>
    );
}
