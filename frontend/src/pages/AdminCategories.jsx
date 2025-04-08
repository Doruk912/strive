import { useState } from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Snackbar,
    Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    '&.MuiTableCell-head': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
}));

const CategoryRow = styled(TableRow)(({ theme, level = 0 }) => ({
    '& > *:first-child': {
        paddingLeft: theme.spacing(2 + level * 3),
    },
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

// Mock data for initial categories
const initialCategories = [
    {
        id: 1,
        name: "Electronics",
        image: "/api/placeholder/400/320",
        parentId: null,
        children: [
            {
                id: 4,
                name: "Smartphones",
                parentId: 1,
                children: [
                    { id: 8, name: "Android", parentId: 4, children: [] },
                    { id: 9, name: "iPhone", parentId: 4, children: [] }
                ]
            },
            {
                id: 5,
                name: "Laptops",
                parentId: 1,
                children: []
            }
        ]
    },
    {
        id: 2,
        name: "Clothing",
        image: "/api/placeholder/400/320",
        parentId: null,
        children: [
            { id: 6, name: "Men's", parentId: 2, children: [] },
            { id: 7, name: "Women's", parentId: 2, children: [] }
        ]
    },
    {
        id: 3,
        name: "Books",
        image: "/api/placeholder/400/320",
        parentId: null,
        children: []
    }
];

export default function CategoryManagement() {
    const [categories, setCategories] = useState(initialCategories);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ id: null, name: '', image: '', parentId: null });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});

    // Toggle category expansion
    const toggleExpand = (id) => {
        setExpandedCategories(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Open dialog for adding/editing category
    const openDialog = (category = { id: null, name: '', image: '', parentId: null }) => {
        setCurrentCategory(category);
        setDialogOpen(true);
    };

    // Close dialog
    const closeDialog = () => {
        setDialogOpen(false);
        setCurrentCategory({ id: null, name: '', image: '', parentId: null });
    };

    // Generate new unique ID
    const generateId = () => {
        return Math.max(0, ...getAllCategoryIds(categories)) + 1;
    };

    // Get all category IDs (flattened)
    const getAllCategoryIds = (cats) => {
        let ids = [];
        cats.forEach(cat => {
            ids.push(cat.id);
            if (cat.children && cat.children.length > 0) {
                ids = [...ids, ...getAllCategoryIds(cat.children)];
            }
        });
        return ids;
    };

    // Find category by ID in the nested structure
    const findCategoryById = (cats, id) => {
        for (let cat of cats) {
            if (cat.id === id) return cat;
            if (cat.children && cat.children.length > 0) {
                const found = findCategoryById(cat.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    // Save category changes
    const saveCategory = () => {
        if (!currentCategory.name.trim()) {
            showNotification('Category name is required', 'error');
            return;
        }

        if (currentCategory.id) {
            // Update existing category
            updateCategory(categories, currentCategory);
            showNotification('Category updated successfully');
        } else {
            // Add new category
            const newId = generateId();
            const newCategory = {
                id: newId,
                name: currentCategory.name,
                image: currentCategory.image || "/api/placeholder/400/320",
                parentId: currentCategory.parentId,
                children: []
            };

            if (currentCategory.parentId) {
                // Add as child of parent
                addChildToCategory(categories, currentCategory.parentId, newCategory);
            } else {
                // Add as root category
                setCategories([...categories, newCategory]);
            }
            showNotification('Category added successfully');
        }

        closeDialog();
    };

    // Add child to parent category in the nested structure
    const addChildToCategory = (cats, parentId, newChild) => {
        const updatedCategories = [...cats];

        for (let i = 0; i < updatedCategories.length; i++) {
            if (updatedCategories[i].id === parentId) {
                updatedCategories[i].children = [...updatedCategories[i].children, newChild];
                setCategories(updatedCategories);
                return true;
            }

            if (updatedCategories[i].children && updatedCategories[i].children.length > 0) {
                const added = addChildToCategory(updatedCategories[i].children, parentId, newChild);
                if (added) {
                    setCategories(updatedCategories);
                    return true;
                }
            }
        }

        return false;
    };

    // Update category in the nested structure
    const updateCategory = (cats, updatedCategory) => {
        const updatedCategories = [...cats];

        for (let i = 0; i < updatedCategories.length; i++) {
            if (updatedCategories[i].id === updatedCategory.id) {
                updatedCategories[i].name = updatedCategory.name;
                if (updatedCategory.image) {
                    updatedCategories[i].image = updatedCategory.image;
                }
                setCategories(updatedCategories);
                return true;
            }

            if (updatedCategories[i].children && updatedCategories[i].children.length > 0) {
                const updated = updateCategory(updatedCategories[i].children, updatedCategory);
                if (updated) {
                    setCategories(updatedCategories);
                    return true;
                }
            }
        }

        return false;
    };

    // Open confirm dialog to delete category
    const confirmDeleteCategory = (id, parentId = null) => {
        setCategoryToDelete({ id, parentId });
        setConfirmDialogOpen(true);
    };

    // Delete category after confirmation
    const deleteCategory = () => {
        const { id, parentId } = categoryToDelete;

        if (parentId) {
            // Delete from parent's children
            const updatedCategories = [...categories];
            const parent = findParentCategory(updatedCategories, parentId);

            if (parent) {
                parent.children = parent.children.filter(child => child.id !== id);
                setCategories(updatedCategories);
            }
        } else {
            // Delete root category
            setCategories(categories.filter(cat => cat.id !== id));
        }

        setConfirmDialogOpen(false);
        showNotification('Category deleted successfully');
    };

    // Find parent category in the nested structure
    const findParentCategory = (cats, parentId) => {
        for (let cat of cats) {
            if (cat.id === parentId) return cat;
            if (cat.children && cat.children.length > 0) {
                const found = findParentCategory(cat.children, parentId);
                if (found) return found;
            }
        }
        return null;
    };

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    // Recursive component to render category tree
    const CategoryItem = ({ category, level = 0, parentId = null }) => {
        const isExpanded = expandedCategories[category.id];
        const hasChildren = category.children && category.children.length > 0;

        return (
            <>
                <CategoryRow level={level}>
                    <TableCell>
                        <Box display="flex" alignItems="center">
                            {hasChildren && (
                                <IconButton size="small" onClick={() => toggleExpand(category.id)}>
                                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            )}
                            <Typography variant="body1" sx={{ ml: hasChildren ? 1 : 4 }}>
                                {category.name}
                            </Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                        {!parentId && category.image && (
                            <Box
                                component="img"
                                src={category.image}
                                alt={category.name}
                                sx={{
                                    width: 50,
                                    height: 50,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                }}
                            />
                        )}
                    </TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() => openDialog(category)}
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => confirmDeleteCategory(category.id, parentId)}
                            >
                                <DeleteIcon />
                            </IconButton>
                            <IconButton
                                size="small"
                                color="success"
                                onClick={() => openDialog({ parentId: category.id })}
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>
                    </TableCell>
                </CategoryRow>
                {isExpanded && hasChildren && category.children.map(child => (
                    <CategoryItem
                        key={child.id}
                        category={child}
                        level={level + 1}
                        parentId={category.id}
                    />
                ))}
            </>
        );
    };

    return (
        <Box sx={{ mt: -10 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" component="h2">
                        Manage Categories
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => openDialog()}
                    >
                        Add New Category
                    </Button>
                </Box>

            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>Image</StyledTableCell>
                            <StyledTableCell>Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map(category => (
                            <CategoryItem key={category.id} category={category} />
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {currentCategory.id ? 'Edit Category' : 'Add Category'}
                    {currentCategory.parentId && ' (Subcategory)'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Category Name"
                            value={currentCategory.name}
                            onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                            margin="normal"
                        />
                        {!currentCategory.parentId && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Image Upload
                                </Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    sx={{ height: 100 }}
                                >
                                    Upload Image
                                    <input
                                        type="file"
                                        hidden
                                        onChange={(e) => {
                                            if (e.target.files[0]) {
                                                setCurrentCategory({
                                                    ...currentCategory,
                                                    image: "/api/placeholder/400/320"
                                                });
                                            }
                                        }}
                                    />
                                </Button>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button onClick={saveCategory} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this category?
                        {categoryToDelete && !categoryToDelete.parentId &&
                            " This will also delete all its subcategories."}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
                    <Button onClick={deleteCategory} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification */}
            <Snackbar
                open={notification.show}
                autoHideDuration={3000}
                onClose={() => setNotification({ show: false, message: '', type: 'success' })}
            >
                <Alert severity={notification.type} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}