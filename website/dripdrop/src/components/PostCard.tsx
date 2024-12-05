import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CommentIcon from '@mui/icons-material/Comment';

interface PostCardProps {
  images: string[];  // Expect an array of image URLs
  username: string;
  caption: string;
}

const PostCard: React.FC<PostCardProps> = ({ images, username, caption }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  return (
    <Card sx={{ maxWidth: '25rem', marginBottom: '16px' }}>
      {/* Image section */}
      <CardMedia
        component="img"
        image={"https://picsum.photos/200"}  // Use the first image from the images array
        alt="Post image"
      />
      {/* Content of the post */}
      <CardContent>
        <Typography variant="h6" component="div" color="text.primary">
          {username} {/* Display the username */}
        </Typography>
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