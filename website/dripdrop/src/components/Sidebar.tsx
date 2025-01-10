import React, { useState } from 'react';
import { Box, Typography, MenuItem, ListItemIcon, Avatar } from '@mui/material';
import Filter from './Filters'; // Assuming Filter component is imported
import CreatePostModal from './CreatePostModal'; // Import the CreatePostModal component
import { NavLink } from 'react-router';

interface SidebarProps {
  showSearch: boolean;
  setShowSearch: (newValue: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ showSearch, setShowSearch }) => {
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);

  const userEmail = sessionStorage.getItem("email") || "User Email";
  const username = sessionStorage.getItem("username") || "Username";
  const userId = sessionStorage.getItem("id");

  const handleSearchClick = () => setShowSearch(!showSearch);
  const handleFilterClick = () => setFilterOpen(true);
  const handleCreatePostClick = () => setCreatePostModalOpen(true);

  const sidebarItems = [
    { iconClass: "bi bi-house-door", label: "Home", link: "/" },
    { iconClass: "bi bi-search", label: "Search", link: "#", onClick: handleSearchClick },
    { iconClass: "bi bi-plus-square", label: "Post", link: "#", onClick: handleCreatePostClick },
    { iconClass: "bi bi-bookmarks", label: "Lists", link: "/lists" },
    { iconClass: "bi bi-bell", label: "Notifications", link: "/notifications" },
    { iconClass: "bi bi-funnel", label: "Filters", link: "#", onClick: handleFilterClick },
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
            padding: '1rem 0',
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
                height: '7em',
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
        <Box
          sx={{
            border: '1px solid #dfdfdf',
            borderRadius: '0px 0px 5px 5px',
            height: '10vh',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '2rem',
          }}
        >
          <MenuItem
            component={NavLink}
            to="/profile"
            state={{ uID: userId }}
            sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
          >
            <ListItemIcon sx={{ minWidth: 'unset', marginRight: '1rem' }}>
              <Avatar sx={{ height: '3rem', width: '3rem' }} />
            </ListItemIcon>
            <Box>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {userEmail}
              </Typography>
              <Typography sx={{ fontSize: '1rem' }}>@{username}</Typography>
            </Box>
          </MenuItem>
        </Box>

        {/* Filters and Modals */}
        <Filter isFilterOpen={isFilterOpen} setFilterOpen={setFilterOpen} />
        <CreatePostModal isOpen={isCreatePostModalOpen} onClose={() => setCreatePostModalOpen(false)} />
      </Box>
    </>
  );
};

export default Sidebar;
