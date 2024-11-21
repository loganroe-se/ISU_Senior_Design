import React, { useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    IconButton,
    Box,
    Typography,
    TextField,
    FormControl,
    Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDropzone } from "react-dropzone";
import DeleteIcon from "@mui/icons-material/Delete";
import { createPost } from "../api/api";  // Import API functions
import { useContext } from "react";
import { UserContext } from "../context/UserContext";  // Adjust to your context path


const dropzoneStyle: React.CSSProperties = {
    border: "2px dashed #cccccc",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    cursor: "pointer",
    marginTop: "20px",
    marginBottom: "20px",
    transition: "border-color 0.3s ease, background-color 0.3s ease",
    backgroundColor: "#f7f7f7",
};

const dropzoneActiveStyle: React.CSSProperties = {
    ...dropzoneStyle,
    borderColor: "#2196f3",
    backgroundColor: "#e3f2fd",
};

const previewImageStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "15px",
};

const imagePreviewContainer: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
};

const imagePreviewStyle: React.CSSProperties = {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "10px",
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
};

const removeButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    backgroundColor: "#fff",
    borderRadius: "50%",
    boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
    padding: "5px",
};

interface PostModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose }) => {
    const [postDetails, setPostDetails] = useState({
        caption: "",
        clothesUrl: "",
    });
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [posts, setPosts] = useState<any[]>([]);  // Optional: Add specific types instead of `any`
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [error, setError] = useState<string | null>(null);  // Add state for error handling
    const { userID } = useContext(UserContext); // Assuming `userID` is part of the context

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
        accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
        },
        maxFiles: 3,  // Limit to 3 images for this case
    });

    // Remove image
    const removeImage = (index: number) => {
        setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Create new post object with images
        const newPost = {
            userId,
            caption: postDetails.caption,
            clothesUrl: postDetails.clothesUrl,
            images: selectedImages,  // Pass actual image files for upload
        };

        try {
            // Call createPost() to send the post data to the API
            const createdPost = await createPost(newPost);

            // If post is created successfully, update the posts list
            setPosts([createdPost, ...posts]);

            // Reset form after successful submission
            setPostDetails({ caption: "", clothesUrl: "" });
            setSelectedImages([]);

            // Open success snackbar
            setOpenSnackbar(true);
        } catch (error) {
            // Handle error and set error message in the state
            console.error("Failed to create post:", error);
            setError("Failed to create post");  // Set error message for the UI
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth sx={{ borderRadius: 2 }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IconButton edge="end" color="inherit" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                <Box sx={{ width: '100%', maxWidth: 600 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: '#333', fontWeight: 700 }}>
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
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    '& fieldset': {
                                        borderColor: '#ccc',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#2196f3',
                                    },
                                },
                            }}
                        />

                        {/* Clothes URL input */}
                        <TextField
                            name="clothesUrl"
                            label="Clothes URL"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={postDetails.clothesUrl}
                            onChange={handleInputChange}
                            required
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    '& fieldset': {
                                        borderColor: '#ccc',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#2196f3',
                                    },
                                },
                            }}
                        />

                        {/* Drag-and-drop image upload */}
                        <FormControl fullWidth>
                            <div
                                {...getRootProps()}
                                style={isDragActive ? dropzoneActiveStyle : dropzoneStyle}
                            >
                                <input {...getInputProps()} />
                                <Typography variant="body1" sx={{ color: '#444' }}>
                                    {isDragActive
                                        ? 'Drop the image here...'
                                        : selectedImages.length
                                            ? `Selected Images: ${selectedImages.length}`
                                            : 'Drag & drop an image, or click to select'}
                                </Typography>
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

                        {/* Action Buttons */}
                        <DialogActions sx={{ justifyContent: 'flex-end', p: 2, ml: 2 }}>
                            <Button onClick={onClose} color="error" sx={{ px: 4 }}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{
                                    bgcolor: '#2196f3',
                                    '&:hover': {
                                        bgcolor: '#1976d2',
                                    },
                                    marginLeft: 3, // Adjusted to the right
                                }}
                            >
                                Create Post
                            </Button>
                        </DialogActions>
                    </form>
                </Box>
            </DialogContent>

            {/* Snackbar for success message */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={2000}
                onClose={() => {
                    setOpenSnackbar(false);
                    onClose();
                }}
                message="Post created successfully!"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{ bottom: 80 }}
            />
        </Dialog>
    );
};

export default PostModal;
