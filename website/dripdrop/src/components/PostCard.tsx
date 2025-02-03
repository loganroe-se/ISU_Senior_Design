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
import { fetchUserByUsername } from '../api/api';
import { User } from '../types';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CommentIcon from '@mui/icons-material/Comment';
import { NavLink } from 'react-router-dom';

interface PostCardProps {
  images: string;
  username: string;
  caption: string;
  onPostClick: (post: any) => void;
  post: any;
}

const PostCard: React.FC<PostCardProps> = ({ images, username, caption, onPostClick, post }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const [user, setUser] = useState<User>({ id: 0, username: '', email: '' });

  const linkProps = {
    user: user, // Pass full user object
  };

  async function getUser(username: string) {
    const testUser = await fetchUserByUsername(username);
    setUser(testUser);
  }

  useEffect(() => {
    getUser(username);
  }, [username]);

  return (
    <Card
      sx={{
        width: '40%',
        marginBottom: '16px',
        boxShadow: 3,
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        cursor:'pointer',
        '&:hover': {
          backgroundColor: '#f0f0f0', // Same hover color for the card background
          '& .image-overlay': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)', // Darken overlay when hovered
          },
          '& .card-content': {
            backgroundColor: '#f0f0f0', // Light background for content on hover
          },
        },
      }}
      onClick={() => onPostClick(post)}
    >
      {/* Image section */}
      <CardMedia
        component="img"
        image={images}
        alt="Post image"
        sx={{
          transition: '0.3s ease', // Smooth transition for image change
          '&:hover': {
            filter: 'brightness(0.5)', // Darken the image on hover
          },
        }}
      />

      {/* Dark overlay for image (on hover) */}
      <Box
        className="image-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0)', // Default state (transparent)
          zIndex: 1, // Ensure it sits on top of the image
          transition: 'background-color 0.3s ease', // Smooth transition
        }}
      />

      {/* Content of the post */}
      <CardContent className="card-content" sx={{ zIndex: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
          <NavLink
            to={{ pathname: '/profile' }}
            state={linkProps}
            style={{ textDecoration: 'none', color: 'black' }}
          >
            {username}
          </NavLink>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {caption}
        </Typography>
      </CardContent>

      {/* Action buttons for the post */}
      <CardActions>
        <IconButton onClick={handleLike} color={liked ? 'secondary' : 'default'}>
          <FavoriteIcon />
        </IconButton>
        <IconButton onClick={handleSave} color={saved ? 'primary' : 'default'}>
          <BookmarkIcon />
        </IconButton>
        <IconButton>
          <CommentIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default PostCard;
