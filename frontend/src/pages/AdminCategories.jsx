import React, { useState} from 'react';
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
    const [selectedFile, setSelectedFile] = useState(null);

    const handleOpenDialog = (category = { id: null, name: '', image: '', parentId: null }) => {
        setFormData(category);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormData({ id: null, name: '', image: '', parentId: null });
    };

    const handleSaveCategory = async () => {
        if (!formData.name.trim()) {
            setSnackbar({ open: true, message: 'Name is required', severity: 'error' });
            return;
        }

        // Here you would typically upload the image to your server
        // and get back the URL before saving the category
        let imageUrl = formData.image;
        if (selectedFile) {
            // Example upload logic (replace with your actual upload implementation)
            // imageUrl = await uploadImage(selectedFile);
        }

        if (formData.id) {
            setCategories(categories.map(cat => {
                if (cat.id === formData.id) {
                    return { ...cat, name: formData.name, image: imageUrl };
                }
                if (cat.subcategories) {
                    cat.subcategories = cat.subcategories.map(sub =>
                        sub.id === formData.id ? { ...sub, name: formData.name } : sub
                    );
                }
                return cat;
            }));
            setSnackbar({ open: true, message: 'Updated successfully', severity: 'success' });
        } else {
            const newId = Date.now();
            if (formData.parentId) {
                setCategories(categories.map(cat =>
                    cat.id === formData.parentId ? {
                        ...cat,
                        subcategories: [...cat.subcategories, {
                            id: newId,
                            name: formData.name,
                            parentId: formData.parentId
                        }]
                    } : cat
                ));
            } else {
                setCategories([...categories, {
                    ...formData,
                    id: newId,
                    image: imageUrl,
                    subcategories: []
                }]);
            }
            setSnackbar({ open: true, message: 'Added successfully', severity: 'success' });
        }

        setSelectedFile(null);
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

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData({ ...formData, image: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Box sx={{ mt: -10 }}>
            <Paper sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">Categories Management</Typography>
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

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                PaperProps={{
                    sx: {
                        width: '400px',
                        borderRadius: '8px'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: '1px solid #e0e0e0',
                        p: 2,
                        fontSize: '16px',
                        fontWeight: 500
                    }}
                >
                    {formData.id ? 'Edit Item' : 'Add Item'}
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            sx={{
                                fontSize: '14px',
                                color: '#666',
                                mb: 1
                            }}
                        >
                            Name
                        </Typography>
                        <TextField
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            variant="outlined"
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '4px',
                                }
                            }}
                        />
                    </Box>
                    {!formData.parentId && (
                        <Box>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="image-upload"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="image-upload">
                                <Button
                                    component="span"
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        textTransform: 'none',
                                        color: '#2196f3',
                                        borderColor: '#2196f3',
                                        '&:hover': {
                                            borderColor: '#2196f3',
                                            backgroundColor: 'rgba(33, 150, 243, 0.04)'
                                        }
                                    }}
                                >
                                    UPLOAD IMAGE
                                </Button>
                            </label>
                            {formData.image && (
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '200px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions
                    sx={{
                        borderTop: '1px solid #e0e0e0',
                        p: 2,
                        '& .MuiButton-root': {
                            minWidth: '64px',
                            textTransform: 'uppercase',
                            fontWeight: 500
                        }
                    }}
                >
                    <Button
                        onClick={handleCloseDialog}
                        sx={{
                            color: '#2196f3'
                        }}
                    >
                        CANCEL
                    </Button>
                    <Button
                        onClick={handleSaveCategory}
                        variant="contained"
                        sx={{
                            backgroundColor: '#2196f3',
                            '&:hover': {
                                backgroundColor: '#1976d2'
                            }
                        }}
                    >
                        SAVE
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