import React from 'react';
import { Box, Modal, Typography } from '@mui/material';

interface ViewPostModalProps {
    selectedPost: {
        postID: number;
        userID: number;
        caption: string;
        createdDate: string;
    } | null;
    onClose: () => void;
}

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
                    padding: 4,
                    borderRadius: 2,
                    width: 400,
                }}
            >
                {selectedPost && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Post Details
                        </Typography>
                        <Typography variant="body1">Caption: {selectedPost.caption}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Created Date: {selectedPost.createdDate}
                        </Typography>
                    </>
                )}
            </Box>
        </Modal>
    );
};

export default ViewPostModal;
