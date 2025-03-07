import React, { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
    Collapse
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { popularCategories } from '../mockData/Categories';

const Categories = () => {
    const [categories, setCategories] = useState(popularCategories);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', image: '', parentId: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [expandedCategoryId, setExpandedCategoryId] = useState(null);

    const handleOpenDialog = (category = { id: null, name: '', image: '', parentId: null }) => {
        setFormData(category);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormData({ id: null, name: '', image: '', parentId: null });
    };

    const handleSaveCategory = () => {
        if (!formData.name.trim()) {
            setSnackbar({ open: true, message: 'Name is required', severity: 'error' });
            return;
        }

        if (formData.id) {
            setCategories(categories.map(cat => {
                if (cat.id === formData.id) {
                    return { ...cat, name: formData.name, image: formData.image };
                }
                if (cat.subcategories) {
                    cat.subcategories = cat.subcategories.map(sub => sub.id === formData.id ? { ...sub, name: formData.name } : sub);
                }
                return cat;
            }));
            setSnackbar({ open: true, message: 'Updated successfully', severity: 'success' });
        } else {
            const newId = Date.now();
            if (formData.parentId) {
                setCategories(categories.map(cat => cat.id === formData.parentId ? {
                    ...cat,
                    subcategories: [...cat.subcategories, { id: newId, name: formData.name, parentId: formData.parentId }]
                } : cat));
            } else {
                setCategories([...categories, { ...formData, id: newId, subcategories: [] }]);
            }
            setSnackbar({ open: true, message: 'Added successfully', severity: 'success' });
        }

        handleCloseDialog();
    };

    const handleDeleteCategory = (id, parentId = null) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            if (parentId) {
                setCategories(categories.map(cat => cat.id === parentId ? {
                    ...cat,
                    subcategories: cat.subcategories.filter(sub => sub.id !== id)
                } : cat));
            } else {
                setCategories(categories.filter(cat => cat.id !== id));
            }
            setSnackbar({ open: true, message: 'Deleted successfully', severity: 'success' });
        }
    };

    const handleToggleExpand = (id) => {
        setExpandedCategoryId(expandedCategoryId === id ? null : id);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ open: false, message: '', severity: 'success' });
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>Categories Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Category
                </Button>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Name</TableCell>
                            <TableCell>Image</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map(category => (
                            <React.Fragment key={category.id}>
                                <TableRow>
                                    <TableCell>
                                        <IconButton onClick={() => handleToggleExpand(category.id)}>
                                            {expandedCategoryId === category.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>
                                        <img
                                            src={category.image || '/default-category-image.jpg'}
                                            alt={category.name}
                                            style={{ width: 50, height: 50, objectFit: 'cover' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenDialog(category)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteCategory(category.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={4} style={{ paddingBottom: 0, paddingTop: 0 }}>
                                        <Collapse in={expandedCategoryId === category.id} timeout="auto" unmountOnExit>
                                            <Box margin={1}>
                                                <Typography variant="h6" gutterBottom component="div">
                                                    Subcategories
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<AddIcon />}
                                                    onClick={() => handleOpenDialog({ parentId: category.id })}
                                                    sx={{ mb: 2 }}
                                                >
                                                    Add Subcategory
                                                </Button>
                                                <Table size="small" aria-label="subcategories">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Name</TableCell>
                                                            <TableCell>Actions</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {category.subcategories.map(subcategory => (
                                                            <TableRow key={subcategory.id}>
                                                                <TableCell>{subcategory.name}</TableCell>
                                                                <TableCell>
                                                                    <IconButton onClick={() => handleOpenDialog(subcategory)}>
                                                                        <EditIcon />
                                                                    </IconButton>
                                                                    <IconButton onClick={() => handleDeleteCategory(subcategory.id, category.id)} color="error">
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{formData.id ? 'Edit Item' : 'Add Item'}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    {!formData.parentId && (
                        <TextField
                            fullWidth
                            label="Image URL"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveCategory} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Categories;