import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, InputAdornment, CircularProgress } from '@mui/material';
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
    const [searchType, setSearchType] = useState<'all' | 'users' | 'posts'>('all');
    const [loading, setLoading] = useState(false);

    const posts: Post[] = useMemo(() => [
        { id: 100, title: 'Post about React', content: 'This is a React post' },
        { id: 200, title: 'Post about clothes', content: 'This is a clothes post' },
        { id: 300, title: 'Pants', content: 'Check out my new black pants' }
    ], []);

    const performSearch = useCallback(async (type: 'all' | 'users' | 'posts') => {
        if (!searchTerm) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        let results: SearchResult[] = [];

        try {
            const response = await fetch('https://api.dripdropco.com/users');
            const data: ApiUser[] = await response.json();

            const users: User[] = data.map(user => ({
                id: Math.floor(Date.now() * Math.random()),
                name: user.username,
                info: user.email
            }));

            if (type === 'all') {
                results = [
                    ...users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase())),
                    ...posts.filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()))
                ];
            } else if (type === 'users') {
                results = users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
            } else {
                results = posts.filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()));
            }

            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, posts]);

    const handleSearchToggle = (type: 'all' | 'users' | 'posts') => {
        setSearchType(type);
        performSearch(type); // Trigger search when search type is changed
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            performSearch(searchType); // Trigger search on Enter key
        }
    };

    return (
        <Box sx={{ padding: '2rem' }}>
            <TextField
                fullWidth
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress} // Add key press event
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
                        color: searchType === 'all' ? 'primary.main' : 'inherit',
                        borderBottom: searchType === 'all' ? '2px solid #1976d2' : 'none'
                    }}
                >
                    All
                </Button>
                <Button
                    variant="text"
                    onClick={() => handleSearchToggle('posts')}
                    sx={{
                        textTransform: 'none',
                        color: searchType === 'posts' ? 'primary.main' : 'inherit',
                        borderBottom: searchType === 'posts' ? '2px solid #1976d2' : 'none'
                    }}
                >
                    Search Posts
                </Button>
                <Button
                    variant="text"
                    onClick={() => handleSearchToggle('users')}
                    sx={{
                        textTransform: 'none',
                        color: searchType === 'users' ? 'primary.main' : 'inherit',
                        borderBottom: searchType === 'users' ? '2px solid #1976d2' : 'none'
                    }}
                >
                    Search Users
                </Button>
            </Box>

            <Typography variant="h5">
                {searchType === 'all' ? 'All Results' : searchType === 'users' ? 'User Results' : 'Post Results'}
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <CircularProgress />
                </Box>
            ) : (
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
            )}
        </Box>
    );
};

export default SearchPage;
