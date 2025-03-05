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
} from '@mui/material';

const CommonDialog = ({ open, onClose, title, formData, setFormData, onSubmit, type }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const renderFields = () => {
        switch (type) {
            case 'product':
                return (
                    <>
                        <TextField
                            fullWidth
                            name="name"
                            label="Name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            name="description"
                            label="Description"
                            value={formData.description}
                            onChange={handleChange}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <TextField
                            fullWidth
                            name="price"
                            label="Price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            name="stock"
                            label="Stock"
                            type="number"
                            value={formData.stock}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
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
                        <TextField
                            fullWidth
                            name="image"
                            label="Image URL"
                            value={formData.image}
                            onChange={handleChange}
                            margin="normal"
                        />
                    </>
                );
            case 'category':
                return (
                    <>
                        <TextField
                            fullWidth
                            name="name"
                            label="Name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            name="image"
                            label="Image URL"
                            value={formData.image}
                            onChange={handleChange}
                            margin="normal"
                        />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    {renderFields()}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSubmit} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CommonDialog;