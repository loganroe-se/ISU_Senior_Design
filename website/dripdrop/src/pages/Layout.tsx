
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { Routes, Route, Navigate } from 'react-router-dom';
import Profile from './Profile';
import HomePage from './Home';
import Sidebar from '../components/Sidebar';
import EditProfile from './EditProfile';
import Searchbar from '../components/Searchbar';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function Home() {
    //idk if the following can be moved somewhere else or condensed. Feel free to change if need be
    interface User {
        username: string;
        email: string;
        id: string;
    }

    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);

    const [currLocation, setCurrLocation] = useState('');

    const [showSearch, setShowSearch] = useState(false);
    const location = useLocation();

    const performSearch = async() => {
        if(search != "") {
            try {
                const response = await fetch('https://api.dripdropco.com/users');
                const data = await response.json();
    
                let results: User[] = [];
    
                data.forEach((user: User) => {
                    if(user.username.toLowerCase().includes(search)) {
                        results.push(user);
                    }
                });
    
                setSearchResults(results);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
            }
        }
        else {
            setSearchResults([]);
        }
    }

    useEffect(() => {
        performSearch();
    }, [search])

    useEffect(() => {
        if(location.pathname != currLocation) {
            setCurrLocation(location.pathname);
            setShowSearch(false);
        }
    }, [location])

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <Sidebar showSearch={showSearch} setShowSearch={setShowSearch} />
            
            {
                showSearch && <Searchbar value={search} setValue={setSearch} results={searchResults}/>
            }

            <Container
                component="main"
                sx={{ flexGrow: 1, p: 1.5 }}
            >
                <Routes>
                    <Route path="/" element={<Navigate to="/home" />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/editProfile" element={<EditProfile />} />
                </Routes>
            </Container>
        </Box>
    );
}
