
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

    const [lastSearch, setLastSearch] = useState('');
    const [search, setSearch] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [filteredSearchResults, setFilteredSearchResults] = useState<User[]>([]);

    const [currLocation, setCurrLocation] = useState('');

    const [showSearch, setShowSearch] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const performSearch = async() => {
            if(search !== "") {
                try {
                    if(!hasSearched || search.length < lastSearch.length || !search.includes(lastSearch)) {
                        const response = await fetch('https://api.dripdropco.com/users');
                        const data = await response.json();
            
                        let totalResults: User[] = [];
                        let results: User[] = [];
            
                        data.forEach((user: User) => {
                            totalResults.push(user);
                            if(user.username.toLowerCase().includes(search) && search !== "") {
                                results.push(user);
                            }
                        });
    
                        setSearchResults(totalResults);
                        setFilteredSearchResults(results);
    
                        setHasSearched(true);
                        setLastSearch(search);
                    }
                    else {
                        let results: User[] = [];
    
                        searchResults.forEach((result) => {
                            if(result.username.toLowerCase().includes(search)) {
                                results.push(result);
                            }
                        })
    
                        setFilteredSearchResults(results);
                        setLastSearch(search);
                    }
                    
                } catch (error) {
                    console.error('Error fetching user data:', error);
                } finally {
                }
            }
            else {
                setSearchResults([]);
                setFilteredSearchResults([]);
    
                setHasSearched(false);
            }
        }

        performSearch();
    }, [search, hasSearched, lastSearch, searchResults])

    useEffect(() => {
        if(location.pathname !== currLocation) {
            setCurrLocation(location.pathname);
            setShowSearch(false);
        }
    }, [location, currLocation])

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <Sidebar showSearch={showSearch} setShowSearch={setShowSearch} />
            
            {
                showSearch && <Searchbar value={search} setValue={setSearch} results={filteredSearchResults}/>
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
