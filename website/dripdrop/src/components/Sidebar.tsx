import React, { useState } from 'react';
import { Box, Typography, MenuItem, ListItemIcon, Avatar } from '@mui/material';
import Filter from './Filters'; // Assuming Filter component is imported
import CreatePostModal from './CreatePostModal'; // Import the CreatePostModal component
import { NavLink } from 'react-router';
import { useUserContext } from '../Auth/UserContext';

interface SidebarProps {
  showSearch: boolean;
  setShowSearch: (newValue: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ showSearch, setShowSearch }) => {
  const { user } = useUserContext();
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);

  const storedUser = sessionStorage.getItem('user');
  console.log(sessionStorage.getItem('user'));
  const username = storedUser ? JSON.parse(storedUser).username : 'Username';

  const handleSearchClick = () => setShowSearch(!showSearch);
  const handleFilterClick = () => setFilterOpen(true);
  const handleCreatePostClick = () => setCreatePostModalOpen(true);

  const sidebarItems = [
    { iconClass: 'bi bi-house-door', label: 'Home', link: '/' },
    { iconClass: 'bi bi-search', label: 'Search', link: '#', onClick: handleSearchClick },
    { iconClass: 'bi bi-plus-square', label: 'Post', link: '#', onClick: handleCreatePostClick },
    { iconClass: 'bi bi-bell', label: 'Notifications', link: '/notifications' },
    { iconClass: 'bi bi-funnel', label: 'Filters', link: '#', onClick: handleFilterClick },
  ];

  return (
    <>
      <Box>
        {/* Header */}
        <Box
          sx={{
            backgroundColor: '#0073FF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '5px 5px 0px 0px',
            height: '10vh',
            padding: '1rem 2rem',
          }}
        >
          <img
            src="/images/logo.svg"
            alt="logo"
            style={{ width: '30px', height: '45px', marginRight: '.5rem' }}
          />
          <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '2.5rem' }}>
            dripdrop
          </Typography>
        </Box>

        {/* Sidebar Items */}
        <Box
          sx={{
            display: 'grid',
            border: '1px solid #DFDFDF',
            height: '75vh',
          }}
        >
          {sidebarItems.map(({ iconClass, label, link, onClick }, index) => (
            <MenuItem
              key={index}
              component={NavLink}
              to={link}
              onClick={onClick}
              sx={{
                paddingLeft: '2rem',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 'unset',
                  marginRight: '1rem',
                  fontSize: '2rem',
                  color: 'black',
                  width: '3rem',
                  justifyContent: 'center',
                }}
              >
                <i className={iconClass}></i>
              </ListItemIcon>
              <Typography sx={{ fontSize: '1.5rem' }}>{label}</Typography>
            </MenuItem>
          ))}
        </Box>

        {/* Footer */}

        <MenuItem
          component={NavLink}
          to="/profile"
          state={{ userID: user?.id }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            paddingLeft: '1.9rem',
            border: '1px solid #dfdfdf',
            borderRadius: '0px 0px 5px 5px',
            height: '10vh',
          }}
        >
          <ListItemIcon sx={{ minWidth: 'unset', marginRight: '2rem' }}>
            <Avatar sx={{ height: '3rem', width: '3rem' }} />
          </ListItemIcon>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>{user?.email}</Typography>
            <Typography sx={{ fontSize: '1rem' }}>@{username}</Typography>
          </Box>
        </MenuItem>

        {/* Filters and Modals */}
        <Filter isFilterOpen={isFilterOpen} setFilterOpen={setFilterOpen} />
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setCreatePostModalOpen(false)}
        />
      </Box>
    </>
  );
};

export default Sidebar;
