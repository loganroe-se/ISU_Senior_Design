import React, { useState, useEffect } from 'react';
import {
  Box,
  Modal,
  Typography,
  Divider,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { ArrowForward, ArrowBack } from '@mui/icons-material';
import { fetchCommentsByPostID, createComment } from '../api/api'; // Adjust the import path as necessary
import { Comment } from '../types'; // Import the Comment interface
import { v4 as uuidv4 } from 'uuid';

interface ViewPostModalProps {
  selectedPost: {
    postID: number;
    userID: number;
    caption: string;
    createdDate: string;
    images: { imageID: number; imageURL: string }[];
  } | null;
  onClose: () => void;
}

const ViewPostModal: React.FC<ViewPostModalProps> = ({ selectedPost, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]); // Use the Comment interface
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state for comments
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Fallback default image URL
  const defaultImageURL = 'default_image.png';

  // Make sure selectedPost exists and handle cases where it doesn't
  const imagesToDisplay = selectedPost?.images?.length
    ? selectedPost.images
    : [{ imageID: 0, imageURL: defaultImageURL }];

  // Reset image index and fetch comments when selectedPost changes
  useEffect(() => {
    setCurrentImageIndex(0);
    if (selectedPost) {
      setIsLoading(true); // Start loading
      fetchCommentsByPostID(selectedPost.postID)
        .then((fetchedComments) => {
          setComments(fetchedComments);
        })
        .catch(console.error)
        .finally(() => {
          setIsLoading(false); // Stop loading
        });
    }
  }, [selectedPost]);

  const nextImage = () => {
    if (currentImageIndex < imagesToDisplay.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };
  const storedUser = sessionStorage.getItem('user');

  let userID: number;
  if (storedUser) {
    const user = JSON.parse(storedUser); // Parse the JSON string into an object
    userID = user.id; // Access the userID property
  } else {
    console.error('No user found in sessionStorage');
  }

  const handleCommentSubmit = async () => {
    if (newComment.trim() && selectedPost) {
      setIsPostingComment(true); // Start loading
      try {
        await createComment(userID, selectedPost.postID, newComment);

        // Fetch updated comments
        const updatedComments = await fetchCommentsByPostID(selectedPost.postID);

        // Find the newly added comment
        const newAddedComment = updatedComments.find((comment) => comment.content === newComment);

        if (newAddedComment) {
          setComments((prevComments) => [...prevComments, newAddedComment]);
        }

        setNewComment(''); // Clear input field
      } catch (error) {
        console.error('Failed to post comment:', error);
      } finally {
        setIsPostingComment(false); // Stop loading
      }
    }
  };

  // Handle the scenario where the post might not be available anymore (selectedPost is null)
  if (!selectedPost) {
    return null;
  }

  return (
    <Modal open={!!selectedPost} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: 2,
          width: '80%',
          height: '80%',
          display: 'flex',
          flexDirection: 'row',
          boxShadow: 24,
        }}
      >
        {/* Left Side: Image Display */}
        <Box
          sx={{
            flex: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            position: 'relative',
          }}
        >
          {imagesToDisplay.length > 1 && (
            <>
              <IconButton
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                }}
                onClick={prevImage}
                disabled={currentImageIndex === 0}
              >
                <ArrowBack />
              </IconButton>

              <IconButton
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                }}
                onClick={nextImage}
                disabled={currentImageIndex === imagesToDisplay.length - 1}
              >
                <ArrowForward />
              </IconButton>
            </>
          )}

          <img
            src={
              imagesToDisplay[currentImageIndex].imageURL === defaultImageURL
                ? defaultImageURL
                : `https://cdn.dripdropco.com/${imagesToDisplay[currentImageIndex].imageURL}?format=png`
            }
            alt={selectedPost?.caption || 'Default image'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </Box>

        {/* Right Side: Post Details and Comments */}
        <Box sx={{ flex: 1, padding: 3, overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Post Details
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Caption:</strong> {selectedPost?.caption}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            <strong>Created Date:</strong> {selectedPost?.createdDate}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <CircularProgress /> {/* Show loading spinner */}
            </Box>
          ) : (
            <List sx={{ maxHeight: '50%', overflowY: 'auto', mb: 2 }}>
              {comments.map((comment) => (
                <ListItem key={uuidv4()}>
                  {' '}
                  {/* Use commentID as the key */}
                  <ListItemText
                    primary={comment.content}
                    secondary={`User ID: ${comment.userID} - ${comment.createdDate}`}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Add a comment..."
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              variant="contained"
              size="small"
              sx={{ alignSelf: 'flex-end' }}
              onClick={handleCommentSubmit}
              disabled={isPostingComment} // Disable while posting
            >
              {isPostingComment ? <CircularProgress size={20} color="inherit" /> : 'Post'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewPostModal;
