import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSave = () => {
        console.log("Updated Username:", username);
        console.log("Updated Password:", password);
        // Save changes to sessionStorage or make an API call to save data
    };

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <Paper sx={{ minHeight: '100vh', padding: '32px' }}>
            <Box display="flex" alignItems="center" mb={4}>
                <IconButton onClick={handleBack}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" component="h1" textAlign="center" flexGrow={1}>
                    Edit Profile
                </Typography>
            </Box>

            <TextField
                label="Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
                Save Changes
            </Button>
        </Paper>
    );
};

export default EditProfile;
