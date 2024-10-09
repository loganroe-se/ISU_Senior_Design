import React, { useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Sidebar  from '../components/Sidebar';
import Post1 from '../components/Post1';
import Post2 from '../components/Post2';

const drawerWidth = 240;

export default function Home() {

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
            >
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        DripDrop
                    </Typography>
                </Toolbar>
            </AppBar>
            
            <Container
                component="main"
                sx={{

                    justifyContent: 'center',
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    
                }}
            >
                <Post1/>
                <Post2/>
            </Container>
        </Box>
    );
}
