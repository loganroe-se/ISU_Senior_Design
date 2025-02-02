 import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box } from '@mui/material';

interface Marker {
    x: number;
    y: number;
}

interface ImageMarkerProps {
    imageUrls: string[];
    onClose: () => void;
}

const ImageMarker: React.FC<ImageMarkerProps> = ({ imageUrls, onClose }) => {
    const [markers, setMarkers] = useState<{ [key: string]: Marker[] }>({});

    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, imageUrl: string) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100

        setMarkers((prev) => ({
            ...prev,
            [imageUrl]: [...(prev[imageUrl] || []), { x, y }],
        }));
    };


    return (
        <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Place markers on clothing items</DialogTitle>
            <DialogContent>
                {imageUrls.map((imageUrl, idx) => (
                    <Box key={idx} sx={{ position: 'relative', textAlign: 'center', mb: 2 }}>
                        <img
                            src={imageUrl}
                            alt={`Selected ${idx + 1}`}
                            style={{ width: '100%', height: 'auto', cursor: 'crosshair' }}
                            onClick={(e) => handleImageClick(e, imageUrl)}
                        />

                        {/* Render dots as absolute overlays */}
                        {markers[imageUrl]?.map((marker, index) => (
                            <Box
                                key={index}
                                sx={{
                                    position: 'absolute',
                                    top: `${marker.y}%`,
                                    left: `${marker.x}%`,
                                    transform: 'translate(-50%, -50%)',
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor: 'red',
                                    borderRadius: '50%',
                                    pointerEvents: 'none', // Ensures dots don't interfere with clicks
                                }}
                            />
                        ))}
                    </Box>
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Done
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImageMarker;
