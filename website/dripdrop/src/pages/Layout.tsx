// src/Home.tsx
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Profile from './Profile';
import SettingsPage from './Settings';
import SearchResults from './SearchResults';
import HomePage from './Home';
import Sidebar from '../components/Sidebar'; 

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

            <Sidebar /> 
            <Container
                component="main"
                sx={{ flexGrow: 1, p: 3, mt: 8 }} 
            >
                <Routes>
                    <Route path="/" element={<Navigate to="/home" />} /> {/* Redirect to /home */}
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </Container>
        </Box>
    );
}
