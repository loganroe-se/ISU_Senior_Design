import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UserProfile from '../components/UserProfile';

type Post = {
    id: number;
    title: string;
    content: string;
};

type ApiUser = {
    id: number;
    username: string;
    email: string;
};

type User = {
    id: number;
    name: string; 
    info: string; 
};

type SearchResult = Post | User;

const SearchPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showUsers, setShowUsers] = useState(false);
    const [showAll, setShowAll] = useState(true);

    const posts: Post[] = useMemo(() => [
        { id: 1, title: 'Post about React', content: 'This is a React post' },
        { id: 2, title: 'Post about clothes', content: 'This is a clothes post' },
        { id: 3, title: 'Pants', content: 'Check out my new black pants' }
    ], []);

    const performSearch = useCallback(async () => {
        if (!searchTerm) {
            setSearchResults([]);
            return;
        }

        let results: SearchResult[] = [];

        // Fetch users from the API
        try {
            // const response = await fetch('https://jsonplaceholder.typicode.com/users'); // Example API
            const response = await fetch('https://api.dripdropco.com/users');
            const data: ApiUser[] = await response.json();

            // Transform API data to match User type
            const users: User[] = data.map(user => ({
                id: user.id,
                name: user.username, // Map username to name
                info: user.email // Map email to info
            }));

            if (showAll) {
                results = [
                    ...users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase())),
                    ...posts.filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()))
                ];
            } else if (showUsers) {
                results = users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
            } else {
                results = posts.filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()));
            }

            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setSearchResults([]);
        }
    }, [searchTerm, showAll, showUsers, posts]);

    const handleSearchToggle = (searchType: 'posts' | 'users' | 'all') => {
        setShowUsers(searchType === 'users');
        setShowAll(searchType === 'all');
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    };

    return (
        <Box sx={{ padding: '2rem' }}>
            <TextField
                fullWidth
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{ marginBottom: '1rem' }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    )
                }}
            />
            <Box sx={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <Button
                    variant="text"
                    onClick={() => handleSearchToggle('all')}
                    sx={{
                        textTransform: 'none',
                        color: showAll ? 'primary.main' : 'inherit',
                        borderBottom: showAll ? '2px solid #1976d2' : 'none'
                    }}
                >
                    All
                </Button>
                <Button
                    variant="text"
                    onClick={() => handleSearchToggle('posts')}
                    sx={{
                        textTransform: 'none',
                        color: !showUsers && !showAll ? 'primary.main' : 'inherit',
                        borderBottom: !showUsers && !showAll ? '2px solid #1976d2' : 'none'
                    }}
                >
                    Search Posts
                </Button>
                <Button
                    variant="text"
                    onClick={() => handleSearchToggle('users')}
                    sx={{
                        textTransform: 'none',
                        color: showUsers ? 'primary.main' : 'inherit',
                        borderBottom: showUsers ? '2px solid #1976d2' : 'none'
                    }}
                >
                    Search Users
                </Button>
            </Box>

            <Typography variant="h5">
                {showAll ? 'All Results' : showUsers ? 'User Results' : 'Post Results'}
            </Typography>
            <List>
                {searchResults.map((result) => (
                    <ListItem key={result.id}>
                        {'name' in result ? (
                            <UserProfile user={result as User} />
                        ) : (
                            <ListItemText
                                primary={(result as Post).title}
                                secondary={(result as Post).content}
                            />
                        )}
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default SearchPage;
