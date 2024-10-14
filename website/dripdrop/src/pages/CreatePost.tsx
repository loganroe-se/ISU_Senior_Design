import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useDropzone } from 'react-dropzone';
import FormControl from '@mui/material/FormControl';

const dropzoneStyle: React.CSSProperties = {
    border: '2px dashed #cccccc',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center' as 'center', 
    cursor: 'pointer',
    marginTop: '20px',
    marginBottom: '20px',
};


const CreatePost = () => {
    const [postDetails, setPostDetails] = useState({
        caption: '',
        imageUrl: '',
        clothesUrl: '',
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPostDetails({ ...postDetails, [name]: value });
    };

    // Handle image upload through drag-and-drop
    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles[0]) {
            setSelectedImage(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': []
        },
        maxFiles: 1,
    });


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Post Details:', postDetails);
        console.log('Uploaded Image:', selectedImage);
        // Post submission logic here
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
                            <Typography>Drop the image here...</Typography>
                        ) : (
                            <Typography>
                                {selectedImage ? `Selected Image: ${selectedImage.name}` : 'Drag & drop an image here, or click to select one'}
                            </Typography>
                        )}
                    </div>
                </FormControl>

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
        </Box>
    );
};

export default CreatePost;
