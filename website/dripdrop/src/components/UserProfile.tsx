import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useLocation } from 'react-router-dom'; // Import useLocation

type User = {
    id: number;
    name: string;
    info: string;
    profilePicUrl?: string; // Add profile picture URL
};

const UserProfile: React.FC = () => {
    const location = useLocation(); // Get the location
    const user = location.state?.user; // Access the user data passed via state

    if (!user) {
        return <Typography>Loading...</Typography>; // Display loading or error if user data is not available
    }

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            marginBottom: '1rem',
            backgroundColor: '#fafafa'
        }}>
            {/* Circular Profile Picture */}
            <Avatar
                src={user.profilePicUrl}
                alt={user.name}
                sx={{
                    width: { xs: 48, sm: 64, md: 80 },
                    height: { xs: 48, sm: 64, md: 80 },
                    marginRight: '1rem'
                }}
            />

            {/* User Name and Info */}
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {user.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {user.info}
                </Typography>
            </Box>
        </Box>
    );
};

export default UserProfile;
