import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const Profile = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Profile Page
            </Typography>
            <Typography variant="body1">
                This is the profile page where users can view and update their personal information.
            </Typography>
        </Box>
    );
};

export default Profile;
