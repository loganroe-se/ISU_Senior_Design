import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';

const Profile = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [profilePic, setProfilePic] = useState('/path/to/default-profile-pic.jpg'); // default profile pic

    useEffect(() => {
        // Retrieve user info from sessionStorage
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
        
        console.log("User logged out");
    };

    const handleUpdate = () => {
        console.log("Updated email:", email);
        console.log("Updated password:", password);
    };

    const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const imageUrl = reader.result as string;
                setProfilePic(imageUrl);
                sessionStorage.setItem('profilePic', imageUrl); // Store in session
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <ThemeProvider theme={theme}>
            <Paper sx={{ minHeight: '100vh', padding: '32px' }}>
                <Box textAlign="center" mb={4}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Profile
                    </Typography>
                </Box>

                {/* Profile Header */}
                <Box display="flex" flexDirection="column" alignItems="center">
                    <IconButton
                        component="label"
                        sx={{ position: 'relative', width: 100, height: 100 }}
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

                    <Typography variant="h5" mt={2}>{username}</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {email}
                    </Typography>

                    {/* Followers and Following */}
                    <Box display="flex" gap={4} mt={2}>
                        <Typography variant="body1">
                            <strong>100</strong> Followers
                        </Typography>
                        <Typography variant="body1">
                            <strong>50</strong> Following
                        </Typography>
                    </Box>
                </Box>

                {/* Update Email and Password */}
                <Box mt={4}>
                    <Typography variant="h6">Update Email/Password</Typography>
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdate}
                        sx={{ mt: 2 }}
                        fullWidth
                    >
                        Update
                    </Button>
                </Box>

                {/* Log Out and Dark Mode Toggle */}
                <Box mt={4} display="flex" justifyContent="space-between">
                    <Button variant="outlined" color="secondary" onClick={handleLogout}>
                        Log Out
                    </Button>
                    <Box display="flex" alignItems="center">
                        <Typography>Dark Mode</Typography>
                        <Switch
                            checked={isDarkMode}
                            onChange={() => setIsDarkMode(!isDarkMode)}
                            sx={{ ml: 1 }}
                        />
                    </Box>
                </Box>
            </Paper>
        </ThemeProvider>
    );
};

export default Profile;
