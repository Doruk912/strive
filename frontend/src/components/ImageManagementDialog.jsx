import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Divider,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const ImageManagementDialog = ({ open, onClose, product, onSave }) => {
    // const [images, setImages] = useState(product?.images || []);

    const handleImageUpload = (event) => {
        // Handle image upload logic here
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                pb: 1
            }}>
                <Typography variant="h6">Manage Product Images</Typography>
                <Typography variant="subtitle2" sx={{ mt: 0.5, opacity: 0.9 }}>
                    {product?.name}
                </Typography>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                    >
                        Upload Images
                        <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </Button>
                </Box>

                <Grid container spacing={2}>
                    {/* Display uploaded images here */}
                </Grid>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Button onClick={onClose} variant="outlined" sx={{ mr: 1 }}>
                    Cancel
                </Button>
                <Button onClick={onSave} variant="contained" color="primary">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImageManagementDialog;