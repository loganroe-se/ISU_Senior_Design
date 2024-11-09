
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { Routes, Route, Navigate } from 'react-router-dom';
import Profile from './Profile';
import SearchResults from './SearchResults';
import HomePage from './Home';
import Sidebar from '../components/Sidebar'; 
import CreatePost from './CreatePost';
import EditProfile from './EditProfile';

export default function Home() {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <Sidebar /> 
            <Container
                component="main"
                sx={{ flexGrow: 1, p: 1.5 }} 
            >
                <Routes>
                    <Route path="/" element={<Navigate to="/home" />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/editProfile" element={<EditProfile />} />
                </Routes>
            </Container>
        </Box>
    );
}
