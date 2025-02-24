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
  Tabs,
  Tab,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ViewPostModal from '../components/ViewPostModal'; // Import the new component
import { useUserContext } from '../Auth/UserContext';
import { useNavigate, useLocation } from 'react-router';
import { Post } from '../types';
import {
  fetchUserById,
  fetchUserPosts,
  fetchAllPosts,
  fetchFollowers,
  fetchFollowing,
} from '../api/api';
import CreatePostModal from '../components/CreatePostModal';

interface ProfileProps {
  initialTabIndex?: number;
}

const Profile: React.FC<ProfileProps> = ({ initialTabIndex }) => {
  const { user } = useUserContext();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState('/path/to/default-profile-pic.jpg');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState<number>(initialTabIndex ?? 0);
  const [userLoading, setUserLoading] = useState(true);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
  const [postStats, setPostStats] = useState<Record<number, { likes: number; comments: number }>>(
    {}
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { userID } = location.state || { userID: user?.id };

  // Define functions with useCallback for stable references
  const getUser = useCallback(async () => {
    setUserLoading(true);
    if (!userID) return; // If there's no userID, do nothing
    try {
      const data = await fetchUserById(userID);
      if (data) {
        setEmail(data.email);
        setUsername(data.username);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setUserLoading(false);
    }
  }, [userID]);

  const navigateToEditProfile = () => {
    navigate('/editProfile');
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data: Post[] = tabIndex === 0 ? await fetchUserPosts(userID) : await fetchAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [tabIndex, userID]);

  // Fetch followers and following
  const getFollowersAndFollowing = useCallback(async () => {
    if (!user) return;
    try {
      const [followersCount, followingCount] = await Promise.all([
        fetchFollowers(userID),
        fetchFollowing(userID),
      ]);

      setFollowers(followersCount);
      setFollowing(followingCount);
    } catch (error) {
      console.error('Error fetching followers or following:', error);
    }
  }, [user, userID]);

  useEffect(() => {
    if (userID) {
      fetchPosts();
    }
  }, [fetchPosts]);

  useEffect(() => {
    if (userID) {
      getUser();
    }
  }, [getUser]);

  useEffect(() => {
    if (userID) {
      getFollowersAndFollowing();
    }
  }, [getFollowersAndFollowing]);

  useEffect(() => {
    // Set the tabIndex from the state passed via the navigation
    if (location.state?.tabIndex !== undefined) {
      setTabIndex(location.state.tabIndex);
    }
  }, [location.state]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

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
    if (Array.isArray(posts) && posts.length > 0 && Object.keys(postStats).length === 0) {
      const stats = posts.reduce(
        (acc, post) => {
          acc[post.postID] = {
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

  const transformedPost = selectedPost
    ? {
        postID: selectedPost.postID, // Map id to postID if required
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
        <Tabs value={tabIndex} onChange={handleTabChange} centered>
          <Tab label="Posts" />
          {userID === user?.id && <Tab label="Drafts" />}
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <Box mt={3}>
            {Array.isArray(posts) && posts.length > 0 ? (
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
              <Box mt={3}>
                {Array.isArray(posts) && posts.length > 0 ? (
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
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    sx={{
                      p: 4,
                      border: '1px dashed grey',
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <i
                      className="bi bi-camera"
                      style={{ width: '150px', marginBottom: '1rem' }}
                    ></i>

                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No Posts Yet
                    </Typography>
                    {userID == user?.id && (
                      <>
                        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                          Share your first post and let the world see your creativity!
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => setCreatePostModalOpen(true)} // Open the CreatePostModal
                          sx={{
                            borderRadius: '20px',
                            padding: '0.5rem 2rem',
                            textTransform: 'none',
                            fontSize: '1rem',
                          }}
                        >
                          Create Your First Post
                        </Button>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
      <ViewPostModal selectedPost={transformedPost} onClose={closePostModal} />
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
      />
    </Paper>
  );
};

export default Profile;
