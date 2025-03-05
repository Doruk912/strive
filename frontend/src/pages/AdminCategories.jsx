// pages/admin/Categories.jsx
import React, { useState } from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import CommonDialog from '../components/AdminDialog';
import { popularCategories as initialCategories } from '../mockData/Products';

const Categories = () => {
    const [categories, setCategories] = useState(initialCategories);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        image: '',
    });

    const handleAdd = () => {
        setSelectedCategory(null);
        setFormData({ name: '', image: '' });
        setOpenDialog(true);
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setFormData(category);
        setOpenDialog(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            setCategories(categories.filter(category => category.id !== id));
        }
    };

    const handleSubmit = () => {
        if (selectedCategory) {
            setCategories(categories.map(category =>
                category.id === selectedCategory.id ? { ...selectedCategory, ...formData } : category
            ));
        } else {
            setCategories([...categories, { ...formData, id: categories.length + 1 }]);
        }
        setOpenDialog(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Categories Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                >
                    Add Category
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Image</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                                    />
                                </TableCell>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(category)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(category.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <CommonDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                title={selectedCategory ? 'Edit Category' : 'Add Category'}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                type="category"
            />
        </Box>
    );
};

export default Categories;