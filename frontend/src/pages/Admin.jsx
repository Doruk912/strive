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
    Stack,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { products } from '../mockData/Products';

const useResponsive = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    return { isMobile, isTablet, isDesktop };
};

const columns = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'category', label: 'Category', hideOnMobile: true },
    { id: 'description', label: 'Description', hideOnMobile: true },
    { id: 'price', label: 'Price' },
    { id: 'stock', label: 'Stock', hideOnMobile: true },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions' }
];

const Admin = () => {
    const { isMobile } = useResponsive();

    // State management
    const [productData, setProductData] = useState(products);
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
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

    // Adjust rows per page for mobile
    useEffect(() => {
        if (isMobile && rowsPerPage > 5) {
            setRowsPerPage(5);
        }
    }, [isMobile, rowsPerPage]);

    // Handle sort
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Handle search and filter
    useEffect(() => {
        let filtered = [...productData];

        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(product => product.category === categoryFilter);
        }

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
            const updatedProducts = productData.map(product =>
                product.id === currentProduct.id ? { ...formData, id: product.id } : product
            );
            setProductData(updatedProducts);
        } else {
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
        <Box sx={{ width: '100%', p: { xs: 1, sm: 3 } }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <Toolbar
                    sx={{
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        p: 2
                    }}
                >
                    <Typography variant="h6" component="div">
                        Products Management
                    </Typography>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        sx={{
                            width: { xs: '100%', sm: 'auto' },
                            mt: { xs: 2, sm: 0 }
                        }}
                    >
                        <TextField
                            size="small"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon />
                            }}
                            fullWidth
                            sx={{ maxWidth: { sm: 200 } }}
                        />

                        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
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

                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                width: { xs: '100%', sm: 'auto' },
                                flexShrink: 0 // This prevents the buttons from shrinking
                            }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                                sx={{ flexGrow: { xs: 1, sm: 0 } }}
                            >
                                Add Product
                            </Button>

                            {selected.length > 0 && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleBulkDelete}
                                    sx={{ flexGrow: { xs: 1, sm: 0 } }}
                                >
                                    Delete
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Toolbar>

                <TableContainer
                    sx={{
                        overflowX: 'auto',
                        '.MuiTableCell-root': {
                            whiteSpace: 'nowrap',
                            p: { xs: 1, sm: 2 }
                        }
                    }}
                >
                    <Table size={isMobile ? "small" : "medium"}>
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    padding="checkbox"
                                    sx={{
                                        bgcolor: 'grey.100',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <Checkbox
                                        indeterminate={selected.length > 0 && selected.length < filteredProducts.length}
                                        checked={selected.length === filteredProducts.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                {columns.map((column) => (
                                    (!isMobile || !column.hideOnMobile) && (
                                        <TableCell
                                            key={column.id}
                                            sx={{
                                                bgcolor: 'grey.100',
                                                fontWeight: 'bold',
                                                color: 'text.primary'
                                            }}
                                        >
                                            {column.sortable ? (
                                                <TableSortLabel
                                                    active={orderBy === column.id}
                                                    direction={orderBy === column.id ? order : 'asc'}
                                                    onClick={() => handleRequestSort(column.id)}
                                                >
                                                    {column.label}
                                                </TableSortLabel>
                                            ) : (
                                                column.label
                                            )}
                                        </TableCell>
                                    )
                                ))}
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
                                        {!isMobile && <TableCell>{product.category}</TableCell>}
                                        {!isMobile && <TableCell>{product.description}</TableCell>}
                                        <TableCell>${product.price}</TableCell>
                                        {!isMobile && <TableCell>{product.stock}</TableCell>}
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

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>
                    {currentProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                        component="form"
                        sx={{
                            mt: 2,
                            display: 'grid',
                            gap: 2,
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />

                        <FormControl fullWidth>
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
                            multiline
                            rows={3}
                            sx={{ gridColumn: { sm: '1 / -1' } }}
                        />

                        <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />

                        <TextField
                            fullWidth
                            label="Stock"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        />

                        <FormControl fullWidth>
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
                            sx={{ gridColumn: { sm: '1 / -1' } }}
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
                <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
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