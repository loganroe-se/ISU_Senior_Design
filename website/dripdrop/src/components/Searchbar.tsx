import React, { useState } from 'react';
import { Box, Typography, MenuItem, ListItemIcon, Avatar, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import Filter from './Filters'; // Assuming Filter component is imported
import PostModal from './PostModal'; // Import the PostModal component


interface SearchbarItemProps {
  profilePic: string;
  profileName: string;
  profileUsername: string;
  profileID: string;
  onClick?: () => void;
}

const Searchbar = () => {
  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '0px .5rem'
    }}>
      <Box
        sx={{
          height: '95vh',
          width: '30vw',
          border: '1px solid #dfdfdf',
          borderRadius: '10px'
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '10%'
        }}>
          <TextField id="outlined-basic" placeholder="Search..." variant="outlined" sx={{
            width: '90%',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'gray', // Default border color
              },
              '&:hover fieldset': {
                borderColor: 'gray', // Keeps the same color on hover
              },
              '&.Mui-focused fieldset': {
                borderColor: 'gray', // Keeps the same color when focused
                boxShadow: 'none',   // Removes shadow on focus
              },
            },
          }} />
        </Box>
        <Box>
          <SearchbarItem profileName="Bob" profileUsername="bobbyjoe1" profilePic="" profileID=""/>
          <SearchbarItem profileName="Bob" profileUsername="bobbyjoe2" profilePic="" profileID=""/>
          <SearchbarItem profileName="Bob" profileUsername="bobbyjoe3" profilePic="" profileID=""/>
          <SearchbarItem profileName="Bob" profileUsername="bobbyjoe4" profilePic="" profileID=""/>
          <SearchbarItem profileName="Bob" profileUsername="bobbyjoe5" profilePic="" profileID=""/>
          <SearchbarItem profileName="Bob" profileUsername="bobbyjoe6" profilePic="" profileID=""/>
          <SearchbarItem profileName="Bob" profileUsername="bobbyjoe7" profilePic="" profileID=""/>
          <SearchbarItem profileName="Bob" profileUsername="bobbyjoe8" profilePic="" profileID=""/>
        </Box>
      </Box>
    </Box>
  );
};

const SearchbarItem: React.FC<SearchbarItemProps> = ({ profilePic, profileName, profileUsername, profileID, onClick }) => {
  return (
    <MenuItem
      component={Link}
      to="" // Link to the user's profile
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <ListItemIcon sx={{ minWidth: 'unset', marginRight: '1rem' }}>
        <Avatar sx={{ height: '2.5rem', width: '2.5rem' }} src={profilePic} />
      </ListItemIcon>
      <Box>
        <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, lineHeight: '1.5rem' }}>{profileUsername}</Typography>
        <Typography sx={{ fontSize: '.75rem', margin: 0 }}>{profileName}</Typography>
      </Box>
    </MenuItem>
  );
};

export default Searchbar;
