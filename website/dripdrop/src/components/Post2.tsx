// src/components/Post.tsx
import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CommentIcon from '@mui/icons-material/Comment';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';

const Post = () => {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleLike = () => {
        setLiked(!liked);
    };

    const handleSave = () => {
        setSaved(!saved);
    };

    return (
        <Card sx={{ maxWidth: '100%', marginBottom: '16px' }}>
            {/* Image section (example clothing image) */}
            <CardMedia
                component="img"
                image="/outfit_2.jpeg" // Replace with dynamic clothing item image
                alt="Clothing post"
            />

            {/* Content of the post */}
            <CardContent>
                <Typography variant="h5" component="div">
                    User's Fashion Post
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    This is an example of a post showcasing some clothing items. You can click on the clothing items to view more details.
                </Typography>

                {/* List of clickable clothing items */}
                <List>
                    <ListItem component ="button">
                        <Avatar src="/images/clothing1.jpg" />
                        <ListItemText primary="Clothing Item 1" secondary="View more info" />
                    </ListItem>
                    <ListItem component ="button">
                        <Avatar src="/images/clothing2.jpg" />
                        <ListItemText primary="Clothing Item 2" secondary="View more info" />
                    </ListItem>
                </List>
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

export default Post;
