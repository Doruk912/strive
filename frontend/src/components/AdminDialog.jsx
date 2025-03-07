import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Divider,
    Grid,
} from '@mui/material';

const CommonDialog = ({ open, onClose, title, formData, setFormData, onSubmit, type }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const renderProductFields = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                    Basic Information
                </Typography>
                <TextField
                    fullWidth
                    name="name"
                    label="Product Name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                    size="small"
                />
            </Grid>

            <Grid item xs={12}>
                <TextField
                    fullWidth
                    name="description"
                    label="Product Description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    variant="outlined"
                    size="small"
                />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                    Pricing & Classification
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            name="price"
                            label="Price ($)"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                label="Category"
                            >
                                <MenuItem value="Sports">Sports</MenuItem>
                                <MenuItem value="Fitness">Fitness</MenuItem>
                                <MenuItem value="Accessories">Accessories</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );

    const renderFields = () => {
        switch (type) {
            case 'product':
                return renderProductFields();
            case 'category':
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="name"
                                label="Category Name"
                                value={formData.name}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="image"
                                label="Category Image URL"
                                value={formData.image}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                    </Grid>
                );
            default:
                return null;
        }
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
                <Typography variant="h6">{title}</Typography>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ pt: 1 }}>
                    {renderFields()}
                </Box>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{ mr: 1 }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onSubmit}
                    variant="contained"
                    color="primary"
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CommonDialog;