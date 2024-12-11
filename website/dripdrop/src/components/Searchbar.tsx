import { Box, Typography, MenuItem, ListItemIcon, Avatar, TextField, CircularProgress, IconButton } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useRef, useEffect, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchbarItemProps {
  profilePic: string;
  profileUsername: string;
  profileID: string;
  setShowSearchBar: (newValue: boolean) => void;
}

interface User {
  username: string;
  email: string;
  id: string;
}

interface SearchbarProps {
  value: string;
  setValue: (newValue: string) => void;
  results: User[];
  setShowSearchBar: (newValue: boolean) => void;
  isLoading: boolean;
}

const Searchbar: React.FC<SearchbarProps> = ({ value, setValue, results, setShowSearchBar, isLoading }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to handle click outside of the search bar
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        // Trigger the animation and close after it ends
        setIsAnimating(true);
        setTimeout(() => {
          setShowSearchBar(false);
        }, 300); // Match this duration with the animation duration
      }
    };

    // Add event listener for clicks outside of the search bar
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listener when component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowSearchBar]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleClearSearch = () => {
    setValue(''); // Clears the search input
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', padding: '0px .5rem' }}>
      <Box
        ref={searchRef}  // Assign ref to the search bar container
        sx={{
          height: '95vh',
          width: '20vw',
          border: '1px solid #dfdfdf',
          borderRadius: '10px',
          position: 'relative',
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out', // Add transition for both transform and opacity
          transform: isAnimating ? 'translateX(-100%)' : 'translateX(0)',  // Slide to the left
          opacity: isAnimating ? 0 : 1,  // Fade out
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10%' }}>
          <TextField
            id="outlined-basic"
            placeholder="Search..."
            variant="outlined"
            value={value}
            onChange={handleChange}
            sx={{
              width: '90%',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'gray',
                },
                '&:hover fieldset': {
                  borderColor: 'gray',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'gray',
                  boxShadow: 'none',
                },
              },
            }}
          />
          {/* Clear Search Button */}
          {value && (
            <IconButton onClick={handleClearSearch} sx={{ position: 'absolute', right: '6%', top: '2.75%' }}>
              <ClearIcon />
            </IconButton>
          )}
        </Box>

        {/* Show CircularProgress when loading */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {results.length > 0 ? results.map((user) => {
              return <SearchbarItem profileUsername={user.username} profilePic="" profileID={user.id} key={uuidv4()} setShowSearchBar={setShowSearchBar} />;
            }) : (
              <Typography sx={{ width: '90%', marginLeft: '5%' }}>No results found</Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const SearchbarItem: React.FC<SearchbarItemProps> = ({ profilePic, profileUsername, profileID, setShowSearchBar }) => {
  const hideSearchBar = () => {
    setShowSearchBar(false);
  };

  return (
    <MenuItem onClick={hideSearchBar} sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <ListItemIcon sx={{ minWidth: 'unset', marginRight: '1rem' }}>
        <Avatar sx={{ height: '2.5rem', width: '2.5rem' }} src={profilePic} />
      </ListItemIcon>
      <Box>
        <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, lineHeight: '1.5rem' }}>
          {profileUsername}
        </Typography>
      </Box>
    </MenuItem>
  );
};

export default Searchbar;
