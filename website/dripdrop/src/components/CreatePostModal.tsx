import React, { useState } from 'react';
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
  SnackbarContent,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDropzone } from 'react-dropzone';
import { createPost } from '../api/api'; // Import API functions
import { useUserContext } from '../Auth/UserContext';
import ImageMarker from './ImageMarker'; // Import the ImageMarker component

const dropzoneStyle: React.CSSProperties = {
  border: '2px dashed #cccccc',
  borderRadius: '12px',
  padding: '40px',
  textAlign: 'center',
  cursor: 'pointer',
  marginTop: '20px',
  marginBottom: '20px',
  transition: 'border-color 0.3s ease, background-color 0.3s ease',
  backgroundColor: '#f7f7f7',
};

const dropzoneActiveStyle: React.CSSProperties = {
  ...dropzoneStyle,
  borderColor: '#2196f3',
  backgroundColor: '#e3f2fd',
};

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const [postDetails, setPostDetails] = useState({
    caption: '',
    clothesUrl: '',
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const { user } = useUserContext();
  const [showImageMarker, setShowImageMarker] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPostDetails({ ...postDetails, [name]: value });
  };

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];

        setSelectedImages((prevImages) => [
          ...prevImages,
          base64Data,
        ]);

        setShowImageMarker(true);
      };

      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
      setSnackbarMessage('Please select at least one image!');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const id = Number(user?.id);
    const newPost = {
      userID: id,
      caption: postDetails.caption,
      images: selectedImages,
    };

    try {
      setIsLoading(true); // Set loading to true
      await createPost(newPost);
      setPostDetails({ caption: '', clothesUrl: '' });
      setSelectedImages([]);
      setSnackbarMessage('Post created successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Failed to create post:', error);
      setSnackbarMessage('Failed to create post!');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false); // Set loading to false
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
            <FormControl fullWidth>
              <div {...getRootProps()} style={isDragActive ? dropzoneActiveStyle : dropzoneStyle}>
                <input {...getInputProps()} />
                <Typography variant="body1" sx={{ color: '#444' }}>
                  {isDragActive ? 'Drop the image here...' : selectedImages.length ? `Selected Images: ${selectedImages.length}` : 'Drag & drop an image, or click to select'}
                </Typography>
              </div>
            </FormControl>

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
                  '&:hover': { bgcolor: '#1976d2' },
                  marginLeft: 3,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white', marginRight: 2 }} />
                ) : (
                  'Create Post'
                )}
              </Button>
            </DialogActions>
          </form>
        </Box>
      </DialogContent>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => {
          setOpenSnackbar(false);
          onClose();
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ bottom: 80 }}
      >
        <SnackbarContent
          message={snackbarMessage}
          sx={{
            backgroundColor: snackbarSeverity === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            borderRadius: '8px',
            padding: '10px 20px',
          }}
        />
      </Snackbar>

      {showImageMarker && (
        <ImageMarker
          imageUrls={selectedImages.map((base64) => `data:image/png;base64,${base64}`)}
          onClose={() => setShowImageMarker(false)}
        />
      )}
    </Dialog>
  );
};

export default CreatePostModal;
