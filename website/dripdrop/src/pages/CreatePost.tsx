import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useDropzone } from 'react-dropzone';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CommentIcon from '@mui/icons-material/Comment';
import PostCard from '../components/PostCard';

const dropzoneStyle: React.CSSProperties = {
    border: '2px dashed #cccccc',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center' as 'center',
    cursor: 'pointer',
    marginTop: '20px',
    marginBottom: '20px',
};

const previewImageStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
};

const imagePreviewContainer: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
};

const imagePreviewStyle: React.CSSProperties = {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
};

const removeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: 'white',
    borderRadius: '50%',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
};


const CreatePost = () => {
    const [postDetails, setPostDetails] = useState({
        caption: '',
        clothesUrl: '',
    });
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [posts, setPosts] = useState<any[]>([]); // Holds the created posts

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPostDetails({ ...postDetails, [name]: value });
    };

    // Handle image upload through drag-and-drop
    const onDrop = (acceptedFiles: File[]) => {
        setSelectedImages((prevImages) => [...prevImages, ...acceptedFiles]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 5,
    });

    // Remove image
    const removeImage = (index: number) => {
        setSelectedImages((prevImages) =>
            prevImages.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create new post object
        const newPost = {
            caption: postDetails.caption,
            clothesUrl: postDetails.clothesUrl,
            image: selectedImages.map((image) => URL.createObjectURL(image)), // URLs of images
        };

        // Add new post to the list of posts
        setPosts([newPost, ...posts]);

        // Reset form
        setPostDetails({ caption: '', clothesUrl: '' });
        setSelectedImages([]);
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create New Post
            </Typography>
            <form onSubmit={handleSubmit}>
                {/* Caption input */}
                <TextField
                    name="caption"
                    label="Caption"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={postDetails.caption}
                    onChange={handleInputChange}
                    required
                />

                {/* Drag-and-drop image upload */}
                <FormControl fullWidth>
                    <div {...getRootProps()} style={dropzoneStyle}>
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <Typography>Drop the images here...</Typography>
                        ) : (
                            <Typography>
                                {selectedImages.length > 0
                                    ? `Selected Images: ${selectedImages.length}`
                                    : 'Drag & drop images here, or click to select up to 5 images'}
                            </Typography>
                        )}
                    </div>
                </FormControl>

                {/* Image Previews */}
                <Box style={previewImageStyle}>
                    {selectedImages.map((image, index) => {
                        const imageUrl = URL.createObjectURL(image);
                        return (
                            <Box key={index} style={imagePreviewContainer}>
                                <img
                                    src={imageUrl}
                                    alt={`Preview ${index}`}
                                    style={imagePreviewStyle}
                                />
                                <IconButton
                                    aria-label="delete"
                                    onClick={() => removeImage(index)}
                                    style={removeButtonStyle}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        );
                    })}
                </Box>

                {/* URL for clothes */}
                <TextField
                    name="clothesUrl"
                    label="Clothes URL"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={postDetails.clothesUrl}
                    onChange={handleInputChange}
                    required
                />

                {/* Submit button */}
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Create Post
                </Button>
            </form>

            {/* Display created posts */}
            <Box mt={4}>
                {posts.map((post, index) => (
                    <PostCard
                    key={index}
                    image={post.image}
                    username={post.username}
                    caption={post.caption}
                  />
                ))}
            </Box>
        </Box>
    );
};

export default CreatePost;
