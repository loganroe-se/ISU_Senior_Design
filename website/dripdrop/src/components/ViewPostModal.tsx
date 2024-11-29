import React from 'react';
import { Box, Modal, Typography, Divider, TextField, Button } from '@mui/material';

interface ViewPostModalProps {
    selectedPost: {
        postID: number;
        userID: number;
        caption: string;
        createdDate: string;
    } | null;
    onClose: () => void;
}

const mockComments = [
    { username: 'User1', text: 'Great post!' },
    { username: 'User2', text: 'Nice picture!' },
    { username: 'User3', text: 'Love this!' },
];

const ViewPostModal: React.FC<ViewPostModalProps> = ({ selectedPost, onClose }) => {
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
                {selectedPost && (
                    <>
                        {/* Left Side: Image */}
                        <Box
                            sx={{
                                flex: 2,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                                backgroundColor: '#f5f5f5',
                            }}
                        >
                            <img
                                src={`https://picsum.photos/800/600?random`}
                                alt="Post"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        </Box>

                        {/* Right Side: Post Details and Comments */}
                        <Box sx={{ flex: 1, padding: 3, overflowY: 'auto' }}>
                            {/* Post Details */}
                            <Typography variant="h6" gutterBottom>
                                Post Details
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Caption:</strong> {selectedPost.caption}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                <strong>Created Date:</strong> {selectedPost.createdDate}
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            {/* Comments Section */}
                            <Typography variant="h6" gutterBottom>
                                Comments
                            </Typography>
                            <Box sx={{ maxHeight: '50%', overflowY: 'auto', mb: 2 }}>
                                {mockComments.map((comment, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            marginBottom: 2,
                                            padding: 1,
                                            backgroundColor: '#f9f9f9',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Typography variant="body2" color="textPrimary">
                                            <strong>{comment.username}</strong>
                                        </Typography>
                                        <Typography variant="body2">{comment.text}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Add Comment Section */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <TextField
                                    variant="outlined"
                                    size="small"
                                    placeholder="Add a comment..."
                                    fullWidth
                                />
                                <Button variant="contained" size="small" sx={{ alignSelf: 'flex-end' }}>
                                    Post
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
        </Modal>
    );
};

export default ViewPostModal;
