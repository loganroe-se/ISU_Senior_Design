import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Paper, Avatar, IconButton, Divider } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [profilePic, setProfilePic] = useState('/path/to/default-profile-pic.jpg');
    const [postCount, setPostCount] = useState(2); // Placeholder for the number of posts
    const [followers, setFollowers] = useState(150); // Placeholder
    const [following, setFollowing] = useState(120); // Placeholder

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('email');
        const storedUsername = sessionStorage.getItem('username');
        const storedProfilePic = sessionStorage.getItem('profilePic');

        if (storedEmail) setEmail(storedEmail);
        if (storedUsername) setUsername(storedUsername);
        if (storedProfilePic) setProfilePic(storedProfilePic);
    }, []);

    const theme = createTheme({
        palette: {
            mode: isDarkMode ? 'dark' : 'light',
        },
    });

    const handleLogout = () => {
        sessionStorage.clear();
        const currentBaseUrl = window.location.origin;
        window.location.replace(currentBaseUrl);
        console.log("User logged out");
    };

    const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const imageUrl = reader.result;
                if (typeof imageUrl === 'string') {
                    setProfilePic(imageUrl);
                    sessionStorage.setItem('profilePic', imageUrl);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const navigateToEditProfile = () => {
        navigate('/editProfile');
    };

    return (
        <ThemeProvider theme={theme}>
            <Paper sx={{ minHeight: '100vh', padding: '32px' }}>
                <Box textAlign="center" mb={4}>
                </Box>

                {/* Profile Header */}
                <Box display="flex" alignItems="center" mb={2}>
                    <IconButton
                        component="label"
                        sx={{ width: 100, height: 100, mr: 3 }}
                    >
                        <Avatar
                            alt="Profile Picture"
                            src={profilePic}
                            sx={{ width: 100, height: 100 }}
                        />
                        <EditIcon
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                padding: '4px',
                                color: 'gray',
                            }}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleProfilePicChange}
                        />
                    </IconButton>

                    <Box flexGrow={1}>
                        <Typography variant="h5">{username}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {email}
                        </Typography>
                        <Box display="flex" mt={1}>
                            <Typography variant="body2" color="textSecondary" mr={2}>
                                {postCount} Posts
                            </Typography>
                            <Typography variant="body2" color="textSecondary" mr={2}>
                                {followers} Followers
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {following} Following
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        onClick={navigateToEditProfile}
                        sx={{
                            backgroundColor: 'white',
                            color: 'grey',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '20px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                                backgroundColor: '#f0f0f0', // Lighter gray on hover
                            },
                            border: '1px solid grey', // Add a border to make it more defined
                        }}
                    >
                        Edit Profile
                    </Button>

                </Box>

                {/* Divider */}
                <Divider sx={{ my: 2, backgroundColor: 'grey.300' }} />

                {/* User's Posts Section */}
                <Box mt={3}>
                    <Typography variant="h6" gutterBottom>
                        User's Posts
                    </Typography>
                    {/* Example Posts */}
                    <Box mb={2} p={2} sx={{ backgroundColor: 'grey.100', borderRadius: '8px' }}>
                        <Typography variant="body1">
                            Post 1: This is an example of a user's post.
                        </Typography>
                    </Box>
                    <Box mb={2} p={2} sx={{ backgroundColor: 'grey.100', borderRadius: '8px' }}>
                        <Typography variant="body1">
                            Post 2: Another example post from the user.
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </ThemeProvider>
    );
};

export default Profile;
