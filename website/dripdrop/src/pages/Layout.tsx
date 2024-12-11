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

export default function Home() {
  const [lastSearch, setLastSearch] = useState('');
  const [search, setSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [filteredSearchResults, setFilteredSearchResults] = useState<User[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  interface User {
    username: string;
    email: string;
    id: string;
  }

  useEffect(() => {
    const performSearch = async () => {
      if (search !== "") {
        try {
          if (!hasSearched || search.length < lastSearch.length || !search.includes(lastSearch)) {
            const response = await fetch('https://api.dripdropco.com/users');
            const data = await response.json();

            let totalResults: User[] = [];
            let results: User[] = [];

            data.forEach((user: User) => {
              totalResults.push(user);
              if (user.username.toLowerCase().includes(search.toLowerCase())) {
                results.push(user);
              }
            });

            setSearchResults(totalResults);
            setFilteredSearchResults(results);

            setHasSearched(true);
            setLastSearch(search);
          } else {
            let results: User[] = [];
            searchResults.forEach((result) => {
              if (result.username.toLowerCase().includes(search.toLowerCase())) {
                results.push(result);
              }
            });
            setFilteredSearchResults(results);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setSearchResults([]);
        setFilteredSearchResults([]);
        setHasSearched(false);
        setLastSearch('');
      }
    };

    const timeoutId = setTimeout(() => {
      performSearch();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [search, hasSearched, lastSearch, searchResults]);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      {/* Sidebar */}
      <Box sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '.5rem',
        position: 'fixed',
      }}>
        <Sidebar showSearch={showSearch} setShowSearch={setShowSearch} />
      </Box>

      {/* Main content area */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        flexGrow: 1, // Ensure it takes the remaining space
        paddingLeft: '240px', // Adjust based on sidebar width
      }}>
        {/* Conditionally render Searchbar */}
        {showSearch && (
          <Box sx={{ p: 2 }}>
            <Searchbar value={search} setValue={setSearch} results={filteredSearchResults} setShowSearchBar={setShowSearch} />
          </Box>
        )}

        {/* Content Container */}
        <Container
          component="main"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            flexGrow: 1, // Shrinks when search bar is shown
            minHeight: showSearch ? 'calc(100vh - 60px)' : '100vh', // Shrinks the height when search is visible
            p: 1.5,
            transition: 'min-height 0.3s ease',
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/editProfile" element={<EditProfile />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}
