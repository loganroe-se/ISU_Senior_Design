import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const SettingsPage = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Settings Page
            </Typography>
            <Typography variant="body1">
                This is the settings page where users can adjust their preferences
            </Typography>
        </Box>
    );
};

export default SettingsPage;
