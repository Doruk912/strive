import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    Select,
    MenuItem,
    IconButton,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { popularCategories } from '../mockData/Categories';

const FeaturedCategories = () => {
    const [featuredCategories, setFeaturedCategories] = useState([
        ...popularCategories.slice(0, 6).map(cat => ({
            id: cat.id,
            name: cat.name,
            image: cat.image
        }))
    ]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleOpenDialog = () => {
        setOpenDialog(true);
        setSelectedCategory('');
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleAddCategory = () => {
        if (!selectedCategory) {
            setSnackbar({ open: true, message: 'Please select a category', severity: 'error' });
            return;
        }

        const categoryToAdd = popularCategories.find(cat => cat.id === selectedCategory);
        if (featuredCategories.length >= 6) {
            setSnackbar({ open: true, message: 'Maximum 6 categories can be featured', severity: 'error' });
            return;
        }

        if (featuredCategories.some(cat => cat.id === selectedCategory)) {
            setSnackbar({ open: true, message: 'Category already featured', severity: 'error' });
            return;
        }

        setFeaturedCategories([...featuredCategories, {
            id: categoryToAdd.id,
            name: categoryToAdd.name,
            image: categoryToAdd.image
        }]);

        setSnackbar({ open: true, message: 'Category added to featured list', severity: 'success' });
        handleCloseDialog();
    };

    const handleDeleteCategory = (categoryId) => {
        setFeaturedCategories(featuredCategories.filter(cat => cat.id !== categoryId));
        setSnackbar({ open: true, message: 'Category removed from featured list', severity: 'success' });
    };

    const moveCategory = (index, direction) => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === featuredCategories.length - 1)
        ) return;

        const newCategories = [...featuredCategories];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newCategories[index], newCategories[newIndex]] = [newCategories[newIndex], newCategories[index]];
        setFeaturedCategories(newCategories);
    };

    return (
        <Box sx={{ mt: -10 }}>
            <Paper sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">Featured Categories Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                    disabled={featuredCategories.length >= 6}
                >
                    Add Featured Category
                </Button>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Use arrows to reorder. Maximum 6 categories can be featured.
                </Typography>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order</TableCell>
                                <TableCell>Image</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {featuredCategories.map((category, index) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => moveCategory(index, 'up')}
                                            disabled={index === 0}
                                        >
                                            <KeyboardArrowUpIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => moveCategory(index, 'down')}
                                            disabled={index === featuredCategories.length - 1}
                                        >
                                            <KeyboardArrowDownIcon />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            style={{ width: 50, height: 50, objectFit: 'cover' }}
                                        />
                                    </TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={() => handleDeleteCategory(category.id)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Add Featured Category</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                        <Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="" disabled>Select a category</MenuItem>
                            {popularCategories
                                .filter(cat => !featuredCategories.some(f => f.id === cat.id))
                                .map(category => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleAddCategory} variant="contained" color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FeaturedCategories;