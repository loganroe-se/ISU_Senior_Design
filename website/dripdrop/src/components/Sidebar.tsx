import React, { useState } from 'react';
import { Box, Typography, MenuItem, ListItemIcon, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import Filter from './Filters'; // Assuming Filter component is imported
import PostModal from './PostModal'; // Import the PostModal component


interface SidebarItemProps {
  iconClass: string;
  label: string;
  link: string;
  isLast?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  showSearch: boolean;
  setShowSearch: (newValue: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ showSearch, setShowSearch }) => {
  const [isFilterOpen, setFilterOpen] = useState(false); // State for drawer visibility
  const [isPostModalOpen, setPostModalOpen] = useState(false); // State for modal visibility

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '.5rem'
    }}>
      <Box>
        <Box
          sx={{
            backgroundColor: '#0073FF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '5px 5px 0px 0px',
            height: '10vh'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '1rem 2rem',
            }}
          >
            <img src={'/images/logo.svg'} alt="logo" style={{ width: '30px', height: '45px', marginRight: '.5rem' }} />
            <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '2.5rem', margin: 0 }}>dripdrop</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', alignItems: 'center', padding: '1rem 0', border: '1px solid #DFDFDF', height: '75vh' }}>
          <SidebarItem iconClass="bi bi-house-door" label="Home" link="/" />
          <SidebarItem iconClass="bi bi-search" label="Search" link="#" onClick={() => {
            setShowSearch(!showSearch);
          }} />
          <SidebarItem
            iconClass="bi bi-plus-square"
            label="Post"
            link="#"
            onClick={() => setPostModalOpen(true)} // Open the modal on click
          />
          <SidebarItem iconClass="bi bi-bookmarks" label="Lists" link="/lists" />
          <SidebarItem iconClass="bi bi-bell" label="Notifications" link="/notifications" />
          <SidebarItem
            iconClass="bi bi-funnel"
            label="Filters"
            link="#" // Prevent navigation
            onClick={() => setFilterOpen(true)} // Open filter drawer
          />
        </Box>
        <Box sx={{
          border: '1px solid #dfdfdf',
          borderRadius: '0px 0px 5px 5px',
          height: '10vh',
          display: 'flex'
        }}>
          {/* User Information as Sidebar Item */}
          <MenuItem
            component={Link}
            to="/profile" // Link to the user's profile
            sx={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '2rem',
              width: '100%'
            }}
          >
            <ListItemIcon sx={{ minWidth: 'unset', marginRight: '1rem' }}>
              <Avatar sx={{ height: '3rem', width: '3rem' }} />
            </ListItemIcon>
            <Box>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, lineHeight: '1.5rem' }}>{sessionStorage.getItem("email")}</Typography>
              <Typography sx={{ fontSize: '1rem', margin: 0 }}>@{sessionStorage.getItem("username")}</Typography>
            </Box>
          </MenuItem>
        </Box>
        <Filter isFilterOpen={isFilterOpen} setFilterOpen={setFilterOpen} />
      </Box>
      <PostModal isOpen={isPostModalOpen} onClose={() => setPostModalOpen(false)} />
    </Box>
  );
};

const SidebarItem: React.FC<SidebarItemProps> = ({ iconClass, label, link, isLast, onClick }) => {
  return (
    <MenuItem
      component={Link}
      to={link}
      onClick={onClick} // Handle click for filter item
      sx={{
        paddingLeft: '2rem',
        alignItems: 'center',
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 'unset',
          marginRight: '1rem',
          fontSize: '2rem',
          color: 'black',
          height: '3rem',
          width: '3rem',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <i className={iconClass}></i>
      </ListItemIcon>
      <Typography sx={{ fontSize: '1.5rem' }}>{label}</Typography>
    </MenuItem>
  );
};

export default Sidebar;
