import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { User } from '../types'


type UserProfileProps = {
    user: User;
};

const  UserProfile: React.FC<UserProfileProps> = ({ user }) => {
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
                alt={user.username} 
                sx={{
                    width: { xs: 48, sm: 64, md: 80 },  
                    height: { xs: 48, sm: 64, md: 80 },
                    marginRight: '1rem'
                }}
            />
            
            {/* User Name */}
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {user.username}
                </Typography>
            </Box>
        </Box>
    );
};

export default UserProfile;
