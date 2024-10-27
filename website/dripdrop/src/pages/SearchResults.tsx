import React, { useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type Post = {
  id: number;
  title: string;
  content: string;
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

    const posts: Post[] = [
        { id: 1, title: 'Post about React', content: 'This is a React post' },
        { id: 2, title: 'Post about clothes', content: 'This is an clothes post' },
        { id: 3, title: 'Pants', content: 'Check out my new black pants' }
    ];

    const users: User[] = [
        { id: 1, name: 'John Doe', info: 'cool guy' },
        { id: 2, name: 'Rick Roll', info: 'Never going to give you up' }
    ]

  const handleSearch = () => {
    if (showUsers) {
      setSearchResults(users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase())));
    } else {
      setSearchResults(posts.filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase())));
    }
  };

  return (
    <Box sx={{ padding: '2rem' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search
      </Typography>
      <TextField
        fullWidth
        label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
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
          onClick={() => { setShowUsers(false); handleSearch(); }}
          sx={{
            textTransform: 'none',
            color: !showUsers ? 'primary.main' : 'inherit',
            borderBottom: !showUsers ? '2px solid #1976d2' : 'none'
          }}
        >
          Search Posts
        </Button>
        <Button
          variant="text"
          onClick={() => { setShowUsers(true); handleSearch(); }}
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
        {showUsers ? 'User Results' : 'Post Results'}
      </Typography>
      <List>
        {searchResults.map((result) => (
          <ListItem key={result.id}>
            <ListItemText
              primary={'name' in result ? result.name : result.title}
              secondary={'info' in result ? result.info : result.content}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SearchPage;
