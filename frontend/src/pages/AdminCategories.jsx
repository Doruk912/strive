import { useState, useEffect } from 'react';
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
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

export default function CategoryManagement() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ id: null, name: '', parentId: null });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);

    // Get token from localStorage
    const getAuthToken = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.token;
    };

    // Configure axios defaults
    useEffect(() => {
        const token = getAuthToken();
        if (!token) {
            navigate('/login');
            return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchCategories();
    }, [navigate]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                showNotification(
                    error.response?.data?.message || 'Error fetching categories. Please try again later.',
                    'error'
                );
            }
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const saveCategory = async () => {
        if (!currentCategory.name.trim()) {
            showNotification('Category name is required', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('category', new Blob([JSON.stringify({
            name: currentCategory.name,
            parentId: currentCategory.parentId
        })], { type: 'application/json' }));

        if (selectedImage) {
            formData.append('image', selectedImage);
        }

        try {
            if (currentCategory.id) {
                await axios.put(`http://localhost:8080/api/categories/${currentCategory.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                showNotification('Category updated successfully');
            } else {
                await axios.post('http://localhost:8080/api/categories', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                showNotification('Category added successfully');
            }
            fetchCategories();
            closeDialog();
        } catch (error) {
            console.error('Error saving category:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                showNotification(
                    error.response?.data?.message || 'Error saving category. Please try again later.',
                    'error'
                );
            }
        }
    };

    const deleteCategory = async () => {
        try {
            await axios.delete(`http://localhost:8080/api/categories/${categoryToDelete.id}`);
            showNotification('Category deleted successfully');
            fetchCategories();
            setConfirmDialogOpen(false);
        } catch (error) {
            console.error('Error deleting category:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                showNotification(
                    error.response?.data?.message || 'Error deleting category. Please try again later.',
                    'error'
                );
            }
        }
    };

    const toggleExpand = (id) => {
        setExpandedCategories(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const openDialog = (category = { id: null, name: '', parentId: null }) => {
        setCurrentCategory(category);
        setSelectedImage(null);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setCurrentCategory({ id: null, name: '', parentId: null });
        setSelectedImage(null);
    };

    const confirmDeleteCategory = (id) => {
        setCategoryToDelete({ id });
        setConfirmDialogOpen(true);
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    const handleRemoveImage = async () => {
        try {
            await axios.put(`http://localhost:8080/api/categories/${currentCategory.id}`, {
                name: currentCategory.name,
                parentId: currentCategory.parentId,
                removeImage: true
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            showNotification('Image removed successfully');
            fetchCategories();
            closeDialog();
        } catch (error) {
            console.error('Error removing image:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                showNotification(
                    error.response?.data?.message || 'Error removing image. Please try again later.',
                    'error'
                );
            }
        }
    };

    const CategoryItem = ({ category, level = 0 }) => {
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
                        {category.imageBase64 && (
                            <Box
                                component="img"
                                src={`data:${category.imageType};base64,${category.imageBase64}`}
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
                                onClick={() => confirmDeleteCategory(category.id)}
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
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Image Upload
                            </Typography>
                            {currentCategory.imageBase64 ? (
                                <Box sx={{ mb: 2 }}>
                                    <Box
                                        component="img"
                                        src={`data:${currentCategory.imageType};base64,${currentCategory.imageBase64}`}
                                        alt={currentCategory.name}
                                        sx={{
                                            width: '100%',
                                            height: 200,
                                            objectFit: 'contain',
                                            borderRadius: 1,
                                            mb: 1
                                        }}
                                    />
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleRemoveImage}
                                        fullWidth
                                    >
                                        Remove Image
                                    </Button>
                                </Box>
                            ) : (
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
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </Button>
                            )}
                            {selectedImage && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Selected: {selectedImage.name}
                                    </Typography>
                                    <Box
                                        component="img"
                                        src={URL.createObjectURL(selectedImage)}
                                        alt="Preview"
                                        sx={{
                                            width: '100%',
                                            height: 200,
                                            objectFit: 'contain',
                                            borderRadius: 1,
                                            mt: 1
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
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