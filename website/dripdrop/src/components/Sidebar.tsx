import React, { useState } from 'react';
import { Box, Typography, Avatar, MenuItem, ListItemIcon, Drawer } from '@mui/material';
import { Link } from 'react-router-dom';
import FilterAltIcon from '@mui/icons-material/FilterAlt'; // For filter icon
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
    <Box sx={{ pt: 1.5, pb: 1.5 }}>
      <Box
        sx={{
          backgroundColor: '#0073FF',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '10px 10px 0px 0px',
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
        <SidebarItem iconClass="bi bi-gear" label="Settings" link="/settings" isLast />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '1rem 0 1rem 2rem',
          border: '1px solid #DFDFDF',
          borderRadius: '0px 0px 10px 10px',
        }}
      >
        <Avatar sx={{ height: '3rem', width: '3rem', border: '3px solid black' }}></Avatar>
        <Box sx={{ marginLeft: '0.5rem' }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>John Doe</Typography>
          <Typography sx={{ fontSize: '1rem', margin: 0 }}>@user</Typography>
        </Box>
      </Box>

      {/* Filter Drawer */}
      <Filter isFilterOpen={isFilterOpen} setFilterOpen={setFilterOpen} />
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
          fontSize: '2.5rem',
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
