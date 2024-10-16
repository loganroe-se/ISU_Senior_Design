// PostCard.js
import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CommentIcon from '@mui/icons-material/Comment';

const PostCard = ({image, username, caption } : { image: string; username: string; caption: string}) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  return (
    <Card sx={{ maxWidth: '40rem', marginBottom: '16px' }}>
      {/* Image section */}
      <CardMedia
        component="img"
        id="post1_pic"
        image={showLinks ? "/outfit1_dots.png" : image} // Use dynamic clothing item image
        alt="Clothing post"
        onClick={() => setShowLinks(!showLinks)}
      />

      {/* Content of the post */}
      <CardContent>
        <Typography variant="h5" component="div">
          {username}
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