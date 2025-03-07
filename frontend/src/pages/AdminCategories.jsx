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
    Collapse,
    Chip,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    AddCircleOutline as AddSubcategoryIcon,
} from '@mui/icons-material';
import {
    popularCategories,
    getAllSubcategories,
    getSubcategoriesByParent,
    getCategoryById,
    getSubcategoryById,
    getCategoryPath,
    CATEGORY_TYPES,
    CATEGORY_STATUS
} from '../mockData/Categories';

const CategoryRow = ({
                         category,
                         onExpand,
                         onEdit,
                         onDelete,
                         onAddSubcategory,
                         onEditSubcategory,
                         onDeleteSubcategory,
                         isLoading
                     }) => {
    // Use a more stable approach for handling expand/collapse
    const handleExpand = useCallback(() => {
        onExpand(category.id);
    }, [category.id, onExpand]);

    // More stable handling of edit action
    const handleEdit = useCallback(() => {
        onEdit(category);
    }, [category, onEdit]);

    // More stable handling of delete action
    const handleDelete = useCallback(() => {
        onDelete(category.id);
    }, [category.id, onDelete]);

    // More stable handling of add subcategory action
    const handleAddSubcategory = useCallback(() => {
        onAddSubcategory(category);
    }, [category, onAddSubcategory]);

    return (
        <React.Fragment>
            <TableRow>
                <TableCell padding="checkbox">
                    <IconButton size="small" onClick={handleExpand}>
                        {category.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <img
                        src={category.image || '/default-category-image.jpg'}
                        alt={category.name}
                        style={{
                            width: 50,
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: '4px'
                        }}
                        onError={(e) => {
                            e.target.src = '/default-category-image.jpg';
                        }}
                    />
                </TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                    <Chip
                        label={`${category.subcategories.length} subcategories`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                </TableCell>
                <TableCell>
                    <IconButton
                        onClick={handleAddSubcategory}
                        size="small"
                        color="primary"
                        disabled={isLoading}
                    >
                        <AddSubcategoryIcon />
                    </IconButton>
                    <IconButton
                        onClick={handleEdit}
                        size="small"
                        disabled={isLoading}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        onClick={handleDelete}
                        size="small"
                        color="error"
                        disabled={isLoading}
                    >
                        <DeleteIcon />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ padding: 0 }} colSpan={5}>
                    <Collapse in={category.expanded} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, backgroundColor: 'grey.50', borderRadius: 1, p: 2 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Subcategories
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {category.subcategories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} align="center">
                                                <Typography color="textSecondary">
                                                    No subcategories found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        category.subcategories.map((subcategory) => (
                                            <TableRow key={subcategory.id}>
                                                <TableCell>{subcategory.name}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onEditSubcategory(subcategory)}
                                                        disabled={isLoading}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onDeleteSubcategory(category.id, subcategory.id)}
                                                        color="error"
                                                        disabled={isLoading}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

const Categories = () => {
    // Ensure categories have a stable structure
    const [categories, setCategories] = useState(() =>
        popularCategories.map(cat => ({
            ...cat,
            expanded: false,
            subcategories: Array.isArray(cat.subcategories) ? cat.subcategories : []
        }))
    );
    const [openDialog, setOpenDialog] = useState(false);
    const [openSubcategoryDialog, setOpenSubcategoryDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedParentCategory, setSelectedParentCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', image: '' });
    const [subcategoryFormData, setSubcategoryFormData] = useState({ name: '', parentId: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isLoading, setIsLoading] = useState(false);

    // Improve the expand handling to be more stable
    const handleExpandCategory = useCallback((categoryId) => {
        setCategories(prevCategories =>
            prevCategories.map(cat =>
                cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
            )
        );
    }, []);

    const handleCloseDialog = useCallback(() => {
        setOpenDialog(false);
        setSelectedCategory(null);
        setFormData({ name: '', image: '' });
    }, []);

    const handleCloseSubcategoryDialog = useCallback(() => {
        setOpenSubcategoryDialog(false);
        setSelectedParentCategory(null);
        setSubcategoryFormData({ name: '', parentId: null });
    }, []);

    const handleAdd = useCallback(() => {
        setSelectedCategory(null);
        setFormData({ name: '', image: '' });
        setOpenDialog(true);
    }, []);

    const handleEdit = useCallback((category) => {
        setSelectedCategory(category);
        setFormData({
            id: category.id,
            name: category.name,
            image: category.image || ''
        });
        setOpenDialog(true);
    }, []);

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            setIsLoading(true);
            // Create a new array without the deleted category
            setCategories(prevCategories =>
                prevCategories.filter(category => category.id !== id)
            );
            setSnackbar({
                open: true,
                message: 'Category deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error("Delete error:", error);
            setSnackbar({
                open: true,
                message: 'Failed to delete category',
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAddSubcategory = useCallback((parentCategory) => {
        setSelectedParentCategory(parentCategory);
        setSubcategoryFormData({ name: '', parentId: parentCategory.id });
        setOpenSubcategoryDialog(true);
    }, []);

    const handleEditSubcategory = useCallback((subcategory) => {
        setSelectedParentCategory({ id: subcategory.parentId });
        setSubcategoryFormData({
            id: subcategory.id,
            name: subcategory.name,
            parentId: subcategory.parentId
        });
        setOpenSubcategoryDialog(true);
    }, []);

    const handleDeleteSubcategory = useCallback(async (parentId, subcategoryId) => {
        if (!window.confirm('Are you sure you want to delete this subcategory?')) {
            return;
        }

        try {
            setIsLoading(true);
            setCategories(prevCategories =>
                prevCategories.map(cat =>
                    cat.id === parentId
                        ? {
                            ...cat,
                            subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId)
                        }
                        : cat
                )
            );
            setSnackbar({
                open: true,
                message: 'Subcategory deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error("Delete subcategory error:", error);
            setSnackbar({
                open: true,
                message: 'Failed to delete subcategory',
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSubmit = useCallback(async () => {
        try {
            if (!formData.name.trim()) {
                setSnackbar({
                    open: true,
                    message: 'Category name is required',
                    severity: 'error'
                });
                return;
            }

            setIsLoading(true);

            if (selectedCategory) {
                // Update existing category
                setCategories(prevCategories =>
                    prevCategories.map(category =>
                        category.id === selectedCategory.id
                            ? {
                                ...category,
                                name: formData.name,
                                image: formData.image
                            }
                            : category
                    )
                );

                setSnackbar({
                    open: true,
                    message: 'Category updated successfully',
                    severity: 'success'
                });
            } else {
                // Add new category
                const newId = Math.max(...categories.map(c => c.id), 0) + 1;
                const newCategory = {
                    ...formData,
                    id: newId,
                    subcategories: [],
                    expanded: false,
                };

                setCategories(prevCategories => [...prevCategories, newCategory]);

                setSnackbar({
                    open: true,
                    message: 'Category added successfully',
                    severity: 'success'
                });
            }

            handleCloseDialog();
        } catch (error) {
            console.error("Submit error:", error);
            setSnackbar({
                open: true,
                message: 'Failed to save category',
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [categories, formData, selectedCategory, handleCloseDialog]);

    const handleSubmitSubcategory = useCallback(async () => {
        try {
            if (!subcategoryFormData.name.trim()) {
                setSnackbar({
                    open: true,
                    message: 'Subcategory name is required',
                    severity: 'error'
                });
                return;
            }

            setIsLoading(true);

            if (subcategoryFormData.id) {
                // Update existing subcategory
                setCategories(prevCategories =>
                    prevCategories.map(cat =>
                        cat.id === subcategoryFormData.parentId
                            ? {
                                ...cat,
                                subcategories: cat.subcategories.map(sub =>
                                    sub.id === subcategoryFormData.id
                                        ? { ...sub, name: subcategoryFormData.name }
                                        : sub
                                )
                            }
                            : cat
                    )
                );

                setSnackbar({
                    open: true,
                    message: 'Subcategory updated successfully',
                    severity: 'success'
                });
            } else {
                // Add new subcategory
                const newSubcategory = {
                    id: Date.now(),
                    name: subcategoryFormData.name,
                    parentId: subcategoryFormData.parentId
                };

                setCategories(prevCategories =>
                    prevCategories.map(cat =>
                        cat.id === subcategoryFormData.parentId
                            ? {
                                ...cat,
                                subcategories: [...cat.subcategories, newSubcategory]
                            }
                            : cat
                    )
                );

                setSnackbar({
                    open: true,
                    message: 'Subcategory added successfully',
                    severity: 'success'
                });
            }

            handleCloseSubcategoryDialog();
        } catch (error) {
            console.error("Submit subcategory error:", error);
            setSnackbar({
                open: true,
                message: 'Failed to save subcategory',
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [subcategoryFormData, handleCloseSubcategoryDialog]);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    return (
        <Box sx={{ mt: -3 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    borderRadius: 2,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Categories Management
                        </Typography>
                        <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                            Manage your product categories and subcategories
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                        disabled={isLoading}
                        sx={{
                            backgroundColor: 'white',
                            color: 'primary.main',
                            '&:hover': { backgroundColor: 'grey.100' }
                        }}
                    >
                        Add Category
                    </Button>
                </Box>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" width={48} />
                            <TableCell>Image</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Subcategories</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography color="textSecondary">
                                        No categories found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <CategoryRow
                                    key={category.id}
                                    category={category}
                                    onExpand={handleExpandCategory}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onAddSubcategory={handleAddSubcategory}
                                    onEditSubcategory={handleEditSubcategory}
                                    onDeleteSubcategory={handleDeleteSubcategory}
                                    isLoading={isLoading}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Category Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedCategory ? 'Edit Category' : 'Add Category'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Category Name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Image URL"
                            value={formData.image || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Subcategory Dialog */}
            <Dialog
                open={openSubcategoryDialog}
                onClose={handleCloseSubcategoryDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {subcategoryFormData.id ? 'Edit Subcategory' : 'Add Subcategory'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Subcategory Name"
                            value={subcategoryFormData.name || ''}
                            onChange={(e) => setSubcategoryFormData(prev => ({
                                ...prev,
                                name: e.target.value
                            }))}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSubcategoryDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmitSubcategory}
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Categories;