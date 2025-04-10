import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
    Typography,
    Grid,
    Alert
} from '@mui/material';
import {
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import axios from 'axios';

const ImageManagementDialog = ({ open, onClose, product, onSave }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (product && product.images) {
            setExistingImages(product.images.sort((a, b) => a.displayOrder - b.displayOrder));
        }
    }, [product]);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleRemoveSelectedFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = async (imageId) => {
        try {
            await axios.delete(`http://localhost:8080/api/products/${product.id}/images/${imageId}`);
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
            setError('');
        } catch (error) {
            console.error('Error removing image:', error);
            setError('Failed to remove image. Please try again.');
        }
    };

    const handleMoveImage = async (currentIndex, direction) => {
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= existingImages.length) return;

        try {
            // First update the UI optimistically
            const reorderedImages = [...existingImages];
            const [movedImage] = reorderedImages.splice(currentIndex, 1);
            reorderedImages.splice(newIndex, 0, movedImage);
            setExistingImages(reorderedImages);

            // Then send the request to the backend
            const imageIds = reorderedImages.map(img => img.id);
            console.log('Sending reorder request with image IDs:', imageIds);
            
            const response = await axios.put(
                `http://localhost:8080/api/products/${product.id}/images/reorder`,
                imageIds
            );
            console.log('Reorder response:', response.data);

            if (response.data && response.data.images) {
                // Sort the received images by display order
                const sortedImages = response.data.images.sort((a, b) => a.displayOrder - b.displayOrder);
                setExistingImages(sortedImages);
            }
            setError('');
        } catch (error) {
            console.error('Error reordering images:', error);
            // Revert the optimistic update on error
            if (product && product.images) {
                setExistingImages(product.images.sort((a, b) => a.displayOrder - b.displayOrder));
            }
            setError('Failed to reorder images. Please try again.');
        }
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('product', JSON.stringify({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.categoryId,
            status: product.status
        }));
        
        // First save the reordered images
        try {
            const imageIds = existingImages.map(img => img.id);
            await axios.put(
                `http://localhost:8080/api/products/${product.id}/images/reorder`,
                imageIds
            );
        } catch (error) {
            console.error('Error saving image order:', error);
            setError('Failed to save image order. Please try again.');
            return;
        }

        // Then handle any new images
        if (selectedFiles.length > 0) {
            selectedFiles.forEach(file => {
                formData.append('images', file);
            });

            try {
                const response = await axios.put(
                    `http://localhost:8080/api/products/${product.id}/with-images`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                onSave(response.data.images);
                setSelectedFiles([]);
                setError('');
                onClose();
            } catch (error) {
                console.error('Error saving images:', error);
                setError('Failed to save new images. Please try again.');
            }
        } else {
            onSave(existingImages);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Manage Product Images</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Current Images
                    </Typography>
                    <Grid container spacing={2}>
                        {existingImages.map((image, index) => (
                            <Grid item xs={4} key={image.id}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        height: 200,
                                        border: '1px solid #ddd',
                                        borderRadius: 1,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <img
                                        src={`data:${image.imageType};base64,${image.imageBase64}`}
                                        alt="Product"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        display: 'flex',
                                        gap: 1,
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        borderRadius: 1,
                                        p: 0.5
                                    }}>
                                        {index > 0 && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleMoveImage(index, 'up')}
                                                sx={{
                                                    backgroundColor: 'white',
                                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                                                }}
                                            >
                                                <ArrowUpwardIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                        {index < existingImages.length - 1 && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleMoveImage(index, 'down')}
                                                sx={{
                                                    backgroundColor: 'white',
                                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                                                }}
                                            >
                                                <ArrowDownwardIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveExistingImage(image.id)}
                                            sx={{
                                                backgroundColor: 'white',
                                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Add New Images
                    </Typography>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        Upload Images
                        <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </Button>
                    <Grid container spacing={2}>
                        {selectedFiles.map((file, index) => (
                            <Grid item xs={4} key={index}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        height: 200,
                                        border: '1px solid #ddd',
                                        borderRadius: 1,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Preview ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                            }
                                        }}
                                        onClick={() => handleRemoveSelectedFile(index)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImageManagementDialog;