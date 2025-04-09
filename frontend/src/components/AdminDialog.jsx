import React, { useState, useEffect } from 'react';
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
import axios from 'axios';

const CommonDialog = ({ open, onClose, title, formData, setFormData, onSubmit, type }) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (type === 'product' && open) {
            fetchCategories();
        }
    }, [type, open]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'price' && value < 0) {
            return; // Prevent negative prices
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const flattenCategories = (categories) => {
        const flattened = [];
        const processCategory = (category, parentNames = []) => {
            const displayName = [...parentNames, category.name].join(' → ');
            flattened.push({
                id: category.id,
                name: displayName
            });
            if (category.children && category.children.length > 0) {
                category.children.forEach(child => {
                    processCategory(child, [...parentNames, category.name]);
                });
            }
        };
        categories.forEach(category => processCategory(category));
        return flattened;
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
                    value={formData.name || ''}
                    onChange={handleChange}
                    variant="outlined"
                    size="small"
                    required
                />
            </Grid>

            <Grid item xs={12}>
                <TextField
                    fullWidth
                    name="description"
                    label="Product Description"
                    value={formData.description || ''}
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
                            value={formData.price || ''}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                            required
                            inputProps={{ min: "0", step: "0.01" }}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth size="small" required>
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="categoryId"
                                value={formData.categoryId || ''}
                                onChange={handleChange}
                                label="Category"
                            >
                                {flattenCategories(categories).map(category => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
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
            case 'employee':
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                Employee Information
                            </Typography>
                            <TextField
                                fullWidth
                                name="name"
                                label="Employee Name"
                                value={formData.name}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                Position & Salary
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        name="position"
                                        label="Position"
                                        value={formData.position}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        name="salary"
                                        label="Salary ($)"
                                        type="number"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                        InputProps={{
                                            startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                                        }}
                                    />
                                </Grid>
                            </Grid>
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