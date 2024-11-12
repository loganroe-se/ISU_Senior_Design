import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  CardMedia,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CommentIcon from "@mui/icons-material/Comment";

const PostCard = ({
  images,
  username,
  caption,
}: {
  images: string[];
  username: string;
  caption: string;
}) => {
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
    <Card sx={{ maxWidth: "25rem", marginBottom: "16px" }}>
      {/* Loop through images, display the first image or a carousel */}
      {images.length > 0 ? (
        images.map((img, index) => (
          <CardMedia
            component="img"
            key={index}
            image={img}
            alt={`Post image ${index + 1}`}
            onClick={() => setShowLinks(!showLinks)} // Optional: toggle something when the image is clicked
          />
        ))
      ) : (
        <CardMedia
          component="img"
          image="/default_image.jpg"
          alt="Default image"
        />
      )}

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
        <IconButton
          onClick={handleLike}
          color={liked ? "secondary" : "default"}
        >
          <FavoriteIcon />
        </IconButton>
        <IconButton onClick={handleSave} color={saved ? "primary" : "default"}>
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
