import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    Box,
    Paper,
    Avatar,
    IconButton,
    Divider,
    ImageList,
    ImageListItem,
    CircularProgress,
    Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ViewPostModal from '../components/ViewPostModal'; // Import the new component
import { useLocation, useNavigate } from 'react-router';


interface Post {
    postID: number;
    userID: number;
    caption: string;
    createdDate: string;
}

const Profile = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [profilePic, setProfilePic] = useState('/path/to/default-profile-pic.jpg');
    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [hoveredPost, setHoveredPost] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [followers, setFollowers] = useState<number>(0);
    const [following, setFollowing] = useState<number>(0);
    const [postStats, setPostStats] = useState<Record<number, { likes: number; comments: number }>>({});


    const navigate = useNavigate();

    let userID = sessionStorage.getItem('userID');
    let location = useLocation();

    // Define functions with useCallback for stable references
    const getUser = useCallback(async () => {
        if (!userID) return;
        try {
            const response = await fetch(`https://api.dripdropco.com/users/${userID}`);
            const data = await response.json();
            setEmail(data.email);
            setUsername(data.username);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }, [userID]);

    try {
        userID = location.state.uID;
        getUser();
    }
    catch {

    }
    const navigateToEditProfile = () => {
        navigate('/editProfile');
    };


    useEffect(() => {
        const storedEmail = sessionStorage.getItem('email');
        const storedUsername = sessionStorage.getItem('username');
        const storedProfilePic = sessionStorage.getItem('profilePic');

        if (username === '') {
            if (storedEmail) setEmail(storedEmail);
            if (storedUsername) setUsername(storedUsername);
            if (storedProfilePic) setProfilePic(storedProfilePic);
        }

        if (userID) {
            fetch(`https://api.dripdropco.com/posts?${userID}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Error fetching posts: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then((data: Post[]) => {
                    setPosts(data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    setLoading(false);
                });
        }
    }, [userID, username]);

    const handlePostClick = (post: Post) => {
        setSelectedPost(post);
    };

    const closePostModal = () => {
        setSelectedPost(null);
    };
    const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            setProfilePic(fileUrl);
        }
    };
    const handleLogout = () => {
        sessionStorage.clear();
        const currentBaseUrl = window.location.origin;
        window.location.replace(currentBaseUrl);
    };

    // Function to initialize random stats for posts
    useEffect(() => {
        if (posts.length > 0 && Object.keys(postStats).length === 0) {
            const stats = posts.reduce((acc, post) => {
                acc[post.postID] = {
                    likes: Math.floor(Math.random() * 500), // Random likes
                    comments: Math.floor(Math.random() * 100), // Random comments
                };
                return acc;
            }, {} as Record<number, { likes: number; comments: number }>);
            setPostStats(stats);
        }
    }, [posts, postStats]);


    // Fetch followers and following
    const getFollowersAndFollowing = useCallback(async () => {
        if (!userID) return;
        try {
            const followersResponse = await fetch(`https://api.dripdropco.com/follow/${userID}/followers`);
            const followersData = await followersResponse.json();
            setFollowers(followersData.length);

            const followingResponse = await fetch(`https://api.dripdropco.com/follow/${userID}/following`);
            const followingData = await followingResponse.json();
            setFollowing(followingData.length);
        } catch (error) {
            console.error('Error fetching followers or following:', error);
        }
    }, [userID]);

    useEffect(() => {
        if (userID) {
            getUser();
            getFollowersAndFollowing();
        }
    }, [userID, getUser, getFollowersAndFollowing]);


    return (

        <Paper sx={{ p: '1em', m: '1em', width:'1' }}>

            <Box display="flex" mb={2}>
                <IconButton component="label" sx={{ width: 100, height: 100, mr: 3 }}>
                    <Avatar alt="Profile Picture" src={profilePic} sx={{ width: 100, height: 100 }} />
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
                    <input type="file" accept="image/*" hidden onChange={handleProfilePicChange} />
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
                            {followers} Followers
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {following} Following
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column', ml: 'auto' }}>
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
                                backgroundColor: '#f0f0f0',
                            },
                            border: '1px solid grey',
                        }}
                    >
                        Edit Profile
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleLogout}
                        sx={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '20px',
                            borderColor: 'error.main',
                            '&:hover': {
                                borderColor: 'darkred',
                                backgroundColor: 'lightcoral',
                            },
                        }}
                    >
                        Log Out
                    </Button>
                </Box>

            </Box>

            <Divider sx={{ my: 2, backgroundColor: 'grey.300' }} />

            <Box mt={3}>
                <Typography variant="h4" gutterBottom>
                    Posts
                </Typography>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : posts.length > 0 ? (
                    <ImageList sx={{ width: '100%', height: 'auto' }} cols={3} gap={16}>
                        {posts.map((post) => (
                            <ImageListItem
                                key={post.postID}
                                onMouseEnter={() => setHoveredPost(post.postID)}
                                onMouseLeave={() => setHoveredPost(null)}
                                onClick={() => handlePostClick(post)}
                                sx={{ cursor: 'pointer', position: 'relative' }}
                            >
                                <img
                                    src={`https://picsum.photos/200?random=${post.postID}`}
                                    alt={post.caption}
                                    loading="lazy"
                                />
                                {hoveredPost === post.postID && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            color: 'white',
                                        }}
                                    >
                                        <Box display="flex" gap={2}>
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <FavoriteIcon />
                                                <Typography>{postStats[post.postID]?.likes || 0}</Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <CommentIcon />
                                                <Typography>{postStats[post.postID]?.comments || 0}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                            </ImageListItem>
                        ))}
                    </ImageList>
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        No posts to display.
                    </Typography>
                )}
            </Box>

            <ViewPostModal selectedPost={selectedPost} onClose={closePostModal} />
        </Paper>


    );
};

export default Profile;
