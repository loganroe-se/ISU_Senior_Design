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
import Header from '@mui/material/TableHead'

const Post = () => {
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
        {/* Image section (example clothing image) */}
        <CardMedia
            component="img"
            id="post2_pic"
            image= {showLinks ? "/outfit2_dots.png": "/outfit_2.jpeg"} // Replace with dynamic clothing item image
            alt="Clothing post"

            onClick={() =>
                setShowLinks(!showLinks)
            } 
        />

            {/* Content of the post */}
            <CardContent>
                <Typography variant="h5" component="div">
                    KatieDowers32
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Im in love with this new coat. It pairs so well with the rest of the fit!
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

export default Post;
