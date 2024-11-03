import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const Profile = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const theme = createTheme({
        palette: {
            mode: isDarkMode ? 'dark' : 'light',
        },
    });

    const handleLogout = () => {
        // Implement logout functionality
        console.log("User logged out");
    };

    const handleUpdate = () => {
        // Implement update functionality
        console.log("Updated email:", email);
        console.log("Updated password:", password);
    };

    return (
        <ThemeProvider theme={theme}>
            <Paper style={{ minHeight: '100vh', padding: '16px' }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Profile Page
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1">Followers: 100</Typography>
                        <Typography variant="body1">Following: 50</Typography>
                    </Box>

                    <Box marginTop={3}>
                        <Typography variant="h5">Your Posts</Typography>
                        {/* Render user posts here */}
                    </Box>

                    <Box marginTop={3}>
                        <Typography variant="h5">Update Email/Password</Typography>
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
                        <Button variant="contained" color="primary" onClick={handleUpdate}>
                            Update
                        </Button>
                    </Box>

                    <Box marginTop={3}>
                        <Button variant="outlined" color="secondary" onClick={handleLogout}>
                            Log Out
                        </Button>
                    </Box>

                    <Box marginTop={3} display="flex" alignItems="center">
                        <Typography>Dark Mode</Typography>
                        <Switch
                            checked={isDarkMode}
                            onChange={() => setIsDarkMode(!isDarkMode)}
                        />
                    </Box>
                </Box>
            </Paper>
        </ThemeProvider>
    );
};

export default Profile;
