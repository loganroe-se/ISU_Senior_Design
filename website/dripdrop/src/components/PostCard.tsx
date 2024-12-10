import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, CardActions, IconButton, Box } from '@mui/material';
import { fetchUserByUsername } from '../api/api';
import { User } from '../types';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CommentIcon from '@mui/icons-material/Comment';

interface PostCardProps {
  images: string;  // Expect an array of image URLs
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

  const [user, setUser] = useState<User>({ id: 0,
    username: "",
    email: "" });

  const linkProps = {
    uID: user.id,
  }


  async function getUser(username:string) {
    let testUser = await fetchUserByUsername(username);

    setUser(testUser);
  }

  useEffect(() => {
    getUser(username);
  }, [username])
  

  return (
    <Card sx={{ maxWidth: '16rem', marginBottom: '16px' }}>
      {/* Image section */}
      <CardMedia
        component="img"
        image={images}  // Use the first image from the images array
        alt="Post image"
      />
      {/* Content of the post */}
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
          <Link to={{ pathname: '/profile'}} state={linkProps} style={{ textDecoration: 'none', color: 'black' }}>
            {username} {/* Display the username */}
          </Link>
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