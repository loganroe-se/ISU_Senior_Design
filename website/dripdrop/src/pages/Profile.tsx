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
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ViewPostModal from '../components/ViewPostModal'; // Import the new component
import { useUserContext } from '../Auth/UserContext';
import { useNavigate, useLocation } from 'react-router';
import { Post } from '../types';
import { v4 as uuidv4 } from 'uuid';

const Profile = () => {
  const { user } = useUserContext();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState('/path/to/default-profile-pic.jpg');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [postStats, setPostStats] = useState<Record<number, { likes: number; comments: number }>>(
    {}
  );

  const navigate = useNavigate();
  const location = useLocation();
  const { userID } = location.state || {};
  // Define functions with useCallback for stable references
  const getUser = useCallback(async () => {
    setUserLoading(true);
    if (!userID) return; // If there's no userID, do nothing
    try {
      const response = await fetch(`https://api.dripdropco.com/users/${userID}`);
      const data = await response.json();
      setEmail(data.email);
      setUsername(data.username);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
    finally {
      setUserLoading(false);
    }
  }, [userID]);


  useEffect(() => {
    if (userID) {
      getUser();
    }
  }, [userID, getUser]);


  const navigateToEditProfile = () => {
    navigate('/editProfile');
  };

  useEffect(() => {
    if (user) {
      fetch(`https://api.dripdropco.com/posts/user/${userID}`)
        .then((response) => {
          if (!response.ok) {
            setPosts([]);  // Reset posts state to an empty array if 404 or any error occurs
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
  }, [user, username, userID]);


  const handlePostHover = (index: number) => {
    setHoveredPost(index);
  };
  const handlePostHoverAway = () => {
    setHoveredPost(null);
  };
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
      const stats = posts.reduce(
        (acc, post) => {
          acc[post.id] = {
            likes: Math.floor(Math.random() * 500), // Random likes
            comments: Math.floor(Math.random() * 100), // Random comments
          };
          return acc;
        },
        {} as Record<number, { likes: number; comments: number }>
      );
      setPostStats(stats);
    }
  }, [posts, postStats]);

  // Fetch followers and following
  const getFollowersAndFollowing = useCallback(async () => {
    if (!user) return;
    try {
      const followersResponse = await fetch(
        `https://api.dripdropco.com/follow/${userID}/followers`
      );
      const followersData = await followersResponse.json();
      setFollowers(followersData.length);

      const followingResponse = await fetch(
        `https://api.dripdropco.com/follow/${userID}/following`
      );
      const followingData = await followingResponse.json();
      setFollowing(followingData.length);
    } catch (error) {
      console.error('Error fetching followers or following:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      getUser();
      getFollowersAndFollowing();
    }
  }, [user, getUser, getFollowersAndFollowing]);

  const transformedPost = selectedPost
    ? {
      postID: selectedPost.id, // Map id to postID if required
      userID: selectedPost.userID,
      caption: selectedPost.caption,
      createdDate: selectedPost.createdDate,
      images: selectedPost.images.map((image, index) => ({
        imageID: index,
        imageURL: image.imageURL,
      })),
    }
    : null;

  return (
    <Paper sx={{ p: '1em', m: '1em', width: '1' }}>
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
        {userLoading ? (
          <Box marginLeft={'3em'} marginTop={'2em'}>
            <CircularProgress />
          </Box>
        ) : (
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
        )}
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
            {posts.map((post, index) => (
              <ImageListItem
                key={index}
                onMouseEnter={() => {
                  handlePostHover(index);
                }}
                onMouseLeave={() => {
                  handlePostHoverAway();
                }}
                onClick={() => {
                  handlePostClick(post);
                }}
                sx={{ cursor: 'pointer', position: 'relative' }}
              >
                <img
                  src={
                    post.images[0]
                      ? `https://cdn.dripdropco.com/${post.images[0].imageURL}?format=png`
                      : 'default_image.png'
                  }
                  alt={post.caption}
                  loading="lazy"
                />
                {hoveredPost === index && (
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
                        <Typography>{postStats[post.id]?.likes || 0}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <CommentIcon />
                        <Typography>{postStats[post.id]?.comments || 0}</Typography>
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

      <ViewPostModal selectedPost={transformedPost} onClose={closePostModal} />
    </Paper>
  );
};

export default Profile;
