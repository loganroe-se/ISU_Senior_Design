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
import BookmarkIcon from '@mui/icons-material/Bookmark';
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
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [numLikes, setNumLikes] = useState(post.numLikes);
  const [userProfile, setUserProfile] = useState<User>({ id: 0, username: '', email: '' });

  useEffect(() => {
    async function getUser() {
      const testUser = await fetchUserByUsername(username);
      setUserProfile(testUser);
    }
    getUser();
  }, [username]);

  const handleLike = async () => {
    if (!user || !user.id) {
      console.error('User ID not found in context');
      return;
    }

    const updatedLikes = liked ? numLikes - 1 : numLikes + 1;
    setLiked(!liked);
    setNumLikes(updatedLikes);

    try {
      console.log('POST:', post.postID);
      if (liked) {
        await unlikePost(user.id, post.postID);
      } else {
        await likePost(user.id, post.postID);
      }
    } catch (error) {
      console.error('Error updating like:', error);
      setLiked(!liked); // Revert state if there's an error
      setNumLikes(liked ? numLikes + 1 : numLikes - 1);
    }
  };

  const handleSave = () => {
    setSaved(!saved);
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
            handleLike();
          }}
          color={liked ? 'secondary' : 'default'}
        >
          <FavoriteIcon />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {numLikes}
        </Typography>
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            handleSave();
          }}
          color={saved ? 'primary' : 'default'}
        >
          <BookmarkIcon />
        </IconButton>
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            console.log('Comment clicked');
          }}
        >
          <CommentIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default PostCard;
