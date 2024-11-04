import React, { useState } from 'react';
import { Box, Typography, Avatar, MenuItem, ListItemIcon } from '@mui/material';
import { Link } from 'react-router-dom';
import Filter from './Filters'; // Assuming Filter component is imported

interface SidebarItemProps {
  iconClass: string;
  label: string;
  isLast?: boolean;
  link: string;
  onClick?: () => void;  // Add onClick to handle filter button
}

const Sidebar = () => {
  const [isFilterOpen, setFilterOpen] = useState(false); // State for drawer visibility

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
    }}>
      <Box>
        <Box
          sx={{
            backgroundColor: '#0073FF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
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

        <Box sx={{ padding: '1rem 0', border: '1px solid #DFDFDF' }}>
          <SidebarItem iconClass="bi bi-house-door" label="Home" link="/" />
          <SidebarItem iconClass="bi bi-search" label="Search" link="/search" />
          <SidebarItem iconClass="bi bi-plus-square" label="Post" link="/post" />
          <SidebarItem iconClass="bi bi-bookmarks" label="Lists" link="/lists" />
          <SidebarItem iconClass="bi bi-bell" label="Notifications" link="/notifications" />
          <SidebarItem
            iconClass="bi bi-funnel"
            label="Filters"
            link="#" // Prevent navigation
            onClick={() => setFilterOpen(true)} // Open filter drawer
          />
  

          {/* User Information as Sidebar Item */}
          <MenuItem
            component={Link}
            to="/profile" // Link to the user's profile
            sx={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '2rem',
              marginTop: '1.5rem', // Add space above
            }}
          >
            <ListItemIcon sx={{ minWidth: 'unset', marginRight: '1.5rem' }}>
              <Avatar sx={{ height: '3rem', width: '3rem', border: '3px solid black' }} />
            </ListItemIcon>
            <Box>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{sessionStorage.getItem("email")}</Typography>
              <Typography sx={{ fontSize: '1rem', margin: 0 }}>@{sessionStorage.getItem("username")}</Typography>
            </Box>
          </MenuItem>

        </Box>
        <Filter isFilterOpen={isFilterOpen} setFilterOpen={setFilterOpen} />
      </Box>
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
        marginBottom: isLast ? '0rem' : '1.25rem',
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 'unset',
          marginRight: '1.5rem',
          fontSize: '2rem',
          color: 'black'
        }}
      >
        <i className={iconClass}></i>
      </ListItemIcon>
      <Typography sx={{ fontSize: '1.5rem' }}>{label}</Typography>
    </MenuItem>
  );
};

export default Sidebar;
