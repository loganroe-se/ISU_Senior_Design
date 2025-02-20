import { useUserContext } from '../Auth/UserContext';
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Box,
} from '@mui/material';
import { fetchUserByUsername, likePost, unlikePost } from '../api/api';
import { User, Post } from '../types';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import { NavLink } from 'react-router-dom';

interface PostCardProps {
  images: string;
  username: string;
  caption: string;
  onPostClick: (post: Post) => void;
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ images, username, caption, onPostClick, post }) => {
  const { user } = useUserContext(); // Get the logged-in user from context
  const [numLikes, setNumLikes] = useState(post.numLikes);
  const [userProfile, setUserProfile] = useState<User>({ id: 0, username: '', email: '' });
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function getUser() {
      const testUser = await fetchUserByUsername(username);
      setUserProfile(testUser);
    }
    getUser();
  }, [username]);

  const handleLike = async (postID: number) => {
    if (!user || !user.id) {
      console.error('User ID not found in context');
      return;
    }

    // Toggle the like state in UI immediately
    setLikedPosts((prevLikes) => ({
      ...prevLikes,
      [postID]: !prevLikes[postID],
    }));

    const isCurrentlyLiked = likedPosts[postID] || false;
    const updatedLikes = isCurrentlyLiked ? numLikes - 1 : numLikes + 1;
    setNumLikes(updatedLikes);

    try {
      if (isCurrentlyLiked) {
        await unlikePost(user.id, postID);
      } else {
        await likePost(user.id, postID);
      }
    } catch (error) {
      console.error('Error updating like:', error);

      // Revert state if there's an error
      setLikedPosts((prevLikes) => ({
        ...prevLikes,
        [postID]: isCurrentlyLiked,
      }));
      setNumLikes(isCurrentlyLiked ? numLikes + 1 : numLikes - 1);
    }
  };

  return (
    <Card
      sx={{
        width: '40%',
        marginBottom: '16px',
        boxShadow: 3,
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '#f0f0f0',
          '& .image-overlay': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
          '& .card-content': {
            backgroundColor: '#f0f0f0',
          },
          '& img': { opacity: 0.7 }, // Apply hover effect to the image itself
        },
      }}
      onClick={() => onPostClick(post)}
    >
      <CardMedia component="img" image={images} alt="Post image" />

      <CardContent className="card-content">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
          <NavLink
            to={{ pathname: '/profile' }}
            state={{ user: userProfile }}
            style={{ textDecoration: 'none', color: 'black' }}
          >
            {username}
          </NavLink>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {caption}
        </Typography>
      </CardContent>

      <CardActions>
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            handleLike(post.postID);
          }}
          color={likedPosts ? 'secondary' : 'default'}
        >
          <FavoriteIcon sx={{ color: likedPosts[post.postID] ? 'red' : 'gray' }} />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {numLikes}
        </Typography>
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            onPostClick(post);
          }}
        >
          <CommentIcon />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {post.numComments}
        </Typography>
      </CardActions>
    </Card>
  );
};

export default PostCard;
