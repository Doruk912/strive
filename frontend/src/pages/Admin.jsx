import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Toolbar,
    Typography,
    IconButton,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    Stack
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { products } from '../mockData/Products';

const Admin = () => {
    // State management
    const [productData, setProductData] = useState(products);
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orderBy, setOrderBy] = useState('name');
    const [order, setOrder] = useState('asc');
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        stock: '',
        status: 'active',
        image: null
    });

    // Handle sort
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Handle search and filter
    useEffect(() => {
        let filtered = [...productData];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(product => product.category === categoryFilter);
        }

        // Sort
        filtered.sort((a, b) => {
            const isAsc = order === 'asc';
            if (isAsc) {
                return a[orderBy] < b[orderBy] ? -1 : 1;
            } else {
                return b[orderBy] < a[orderBy] ? -1 : 1;
            }
        });

        setFilteredProducts(filtered);
    }, [searchTerm, categoryFilter, productData, order, orderBy]);

    // Handle selection
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelected(filteredProducts.map(product => product.id));
        } else {
            setSelected([]);
        }
    };

    const handleSelectOne = (id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        setSelected(newSelected);
    };

    // Handle dialog
    const handleOpenDialog = (product = null) => {
        if (product) {
            setFormData(product);
            setCurrentProduct(product);
        } else {
            setFormData({
                name: '',
                category: '',
                description: '',
                price: '',
                stock: '',
                status: 'active',
                image: null
            });
            setCurrentProduct(null);
        }
        setOpenDialog(true);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentProduct) {
            // Update existing product
            const updatedProducts = productData.map(product =>
                product.id === currentProduct.id ? { ...formData, id: product.id } : product
            );
            setProductData(updatedProducts);
        } else {
            // Add new product
            const newProduct = {
                ...formData,
                id: productData.length + 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            setProductData([...productData, newProduct]);
        }
        setOpenDialog(false);
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        const updatedProducts = productData.filter(product => !selected.includes(product.id));
        setProductData(updatedProducts);
        setSelected([]);
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <Toolbar sx={{ pl: 2, pr: 1 }}>
                    <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
                        Products Management
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon />
                            }}
                        />

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                label="Category"
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="sports">Sports</MenuItem>
                                <MenuItem value="fitness">Fitness</MenuItem>
                                <MenuItem value="accessories">Accessories</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add Product
                        </Button>

                        {selected.length > 0 && (
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleBulkDelete}
                            >
                                Delete Selected
                            </Button>
                        )}
                    </Stack>
                </Toolbar>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selected.length > 0 && selected.length < filteredProducts.length}
                                        checked={selected.length === filteredProducts.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'name'}
                                        direction={orderBy === 'name' ? order : 'asc'}
                                        onClick={() => handleRequestSort('name')}
                                    >
                                        Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Stock</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProducts
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((product) => (
                                    <TableRow
                                        key={product.id}
                                        selected={selected.indexOf(product.id) !== -1}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selected.indexOf(product.id) !== -1}
                                                onChange={() => handleSelectOne(product.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>{product.description}</TableCell>
                                        <TableCell>${product.price}</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                        <TableCell>{product.status}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleOpenDialog(product)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => {
                                                setProductData(productData.filter(p => p.id !== product.id));
                                            }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredProducts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>

            {/* Add/Edit Product Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {currentProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }} spacing={3}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                label="Category"
                            >
                                <MenuItem value="sports">Sports</MenuItem>
                                <MenuItem value="fitness">Fitness</MenuItem>
                                <MenuItem value="accessories">Accessories</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Stock"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                label="Status"
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            component="label"
                            sx={{ mt: 2 }}
                        >
                            Upload Image
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setFormData({ ...formData, image: file });
                                }}
                            />
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {currentProduct ? 'Update' : 'Add'} Product
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Admin;