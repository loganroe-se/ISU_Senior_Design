import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, CardActions, IconButton, Box } from '@mui/material';
import { followUser, unfollowUser, fetchUserByUsername } from '../api/api';
import { User } from '../types';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CommentIcon from '@mui/icons-material/Comment';

interface PostCardProps {
  images: string;  // Expect an array of image URLs
  username: string;
  following: boolean;
  caption: string;
}

interface FollowButtonProps {
  following: boolean;
  username: string;
}

const PostCard: React.FC<PostCardProps> = ({ images, username, following, caption }) => {
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
    <Card sx={{ maxWidth: '25rem', marginBottom: '16px' }}>
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
          <FollowButton following={following} username={username} />
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

const FollowButton: React.FC<FollowButtonProps> = ({ following, username }) => {
  let [followedUser, setFollowedUser] = useState<User>();

  async function getUser(username:string) {
    let user = await fetchUserByUsername(username);

    setFollowedUser(user);
  }
  
  let followerID = Number(sessionStorage.getItem("userID"));

  useEffect(() => {
    getUser(username);
  }, [username]);
  

  let followingID:number = 0;
  if(followedUser !== undefined) {
    followingID = Number(followedUser.id);
  }

  return (
    <Typography variant="h6" component="div" sx={{backgroundColor: following ? 'gray' : '#0073FF', color: '#FFFFFF', padding: '0px .5rem', borderRadius: '.75rem', fontSize: '1rem', visibility: username===sessionStorage.getItem("username") ? "hidden" : "visible", display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={() => following ? unfollowUser(followerID, followingID) : followUser(followerID,followingID)}>
      {following ? "Unfollow" : "Follow"}
    </Typography>
  );
};

export default PostCard;