import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Button,
    Paper,
    Avatar,
    IconButton,
    Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';

interface Post {
    postID: number;
    userID: number;
    caption: string;
    createdDate: string;
}


const Profile = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [profilePic, setProfilePic] = useState('/path/to/default-profile-pic.jpg');
    const [posts, setPosts] = useState<Post[]>([]);
    const userID = sessionStorage.getItem('userID');
    console.log("Session UserID: " + sessionStorage.getItem('userID'));

    useEffect(() => {
        // Fetch user details from sessionStorage
        const storedEmail = sessionStorage.getItem('email');
        const storedUsername = sessionStorage.getItem('username');
        const storedProfilePic = sessionStorage.getItem('profilePic');

        if (storedEmail) setEmail(storedEmail);
        if (storedUsername) setUsername(storedUsername);
        if (storedProfilePic) setProfilePic(storedProfilePic);

        // Fetch user posts
        if (userID) {
            fetch(`https://api.dripdropco.com/posts?${userID}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Error fetching posts: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then((data: Post[]) => setPosts(data))
                .catch((error) => console.error(error));
        }
    }, [userID]);

    const handleLogout = () => {
        sessionStorage.clear();
        const currentBaseUrl = window.location.origin;
        window.location.replace(currentBaseUrl);
        console.log('User logged out');
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

            <Paper sx={{ minHeight: '100vh', padding: '32px' }}>
                <Box textAlign="center" mb={4}></Box>

                {/* Profile Header */}
                <Box display="flex" mb={2}>
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

                    <Box>
                        <Typography variant="h5">{username}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {email}
                        </Typography>
                        <Box display="flex" mt={1}>
                            <Typography variant="body2" color="textSecondary" mr={2}>
                                {posts.length} Posts
                            </Typography>
                            <Typography variant="body2" color="textSecondary" mr={2}>
                                {150} Followers
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {120} Following
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 3,
                            flexDirection: 'column',
                            ml: 'auto',
                        }}
                    >
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

                        <Button
                            variant="outlined"
                            color="error" // Set color to red for "Log Out" button
                            onClick={handleLogout}
                            sx={{
                                padding: '0.5rem 1.5rem',
                                borderRadius: '20px',
                                borderColor: 'error.main', // Make the border red as well
                                '&:hover': {
                                    borderColor: 'darkred', // Darker red on hover
                                    backgroundColor: 'lightcoral', // Light red background on hover
                                },
                            }}
                        >
                            Log Out
                        </Button>
                    </Box>
                </Box>

                {/* Divider */}
                <Divider sx={{ my: 2, backgroundColor: 'grey.300' }} />

            <Box mt={3}>
                <Typography variant="h4" gutterBottom>
                    Posts
                </Typography>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard
                            key={post.postID}
                            images={["https://picsum.photos/200"]}
                            username={`User ${post.userID}`} // Replace with actual username if available
                            caption={post.caption}
                        />
                    ))
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        No posts to display.
                    </Typography>
                )}
            </Box>

            </Paper>
    );
};

export default Profile;
