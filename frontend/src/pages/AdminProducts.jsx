import React, { useState, useEffect } from 'react';
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
    CircularProgress,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TablePagination,
    InputAdornment,
    Stack,
    Divider,
    ListSubheader,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Inventory as InventoryIcon,
    Collections as ImagesIcon,
    Search as SearchIcon,
    Sort as SortIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import StockManagementDialog from '../components/StockManagementDialog';
import CommonDialog from '../components/AdminDialog';
import ImageManagementDialog from '../components/ImageManagementDialog';
import { styled } from "@mui/material/styles";
import axios from 'axios';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    '&.MuiTableCell-head': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
}));

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [openStockDialog, setOpenStockDialog] = useState(false);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [categories, setCategories] = useState([]);
    
    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    
    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        status: 'ACTIVE',
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const flattenCategories = (categories) => {
        const flattened = [];

        const processCategory = (category, parentNames = []) => {
            // Add the current category
            const displayName = [...parentNames, category.name].join(' → ');
            flattened.push({
                ...category,
                displayName: displayName
            });

            // Process children if they exist
            if (category.children && category.children.length > 0) {
                category.children.forEach(child => {
                    processCategory(child, [...parentNames, category.name]);
                });
            }
        };

        categories.forEach(category => processCategory(category));
        return flattened;
    };

    const isProductInCategory = (product, categoryId) => {
        if (!categoryId) return true;
        if (product.categoryId === categoryId) return true;

        // Find the product's category in the flattened list
        const flattenedCategories = flattenCategories(categories);
        const productCategory = flattenedCategories.find(c => c.id === product.categoryId);
        if (!productCategory) return false;

        // Check if any part of the product's category path includes the filter category
        const categoryPath = productCategory.displayName.split(' → ');
        const filterCategory = flattenedCategories.find(c => c.id === categoryId);
        if (!filterCategory) return false;

        return categoryPath.includes(filterCategory.name);
    };

    // Filter and sort products
    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = isProductInCategory(product, categoryFilter);
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'price':
                    comparison = a.price - b.price;
                    break;
                case 'category':
                    comparison = a.categoryName.localeCompare(b.categoryName);
                    break;
                default:
                    comparison = 0;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

    // Pagination calculation
    const paginatedProducts = filteredProducts.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleStockManagement = (product) => {
        setSelectedProduct(product);
        setOpenStockDialog(true);
    };

    const handleSaveStocks = async (stocks) => {
        try {
            const response = await axios.put(`http://localhost:8080/api/products/${selectedProduct.id}`, {
                ...selectedProduct,
                stocks: stocks
            });
            setProducts(products.map(product =>
                product.id === selectedProduct.id
                    ? response.data
                    : product
            ));
            setOpenStockDialog(false);
        } catch (error) {
            console.error('Error saving stocks:', error);
        }
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            categoryId: '',
            status: 'ACTIVE',
        });
        setOpenDialog(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setFormData(product);
        setOpenDialog(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:8080/api/products/${id}`);
                setProducts(products.filter(product => product.id !== id));
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleImageManagement = (product) => {
        setSelectedProduct(product);
        setOpenImageDialog(true);
    };

    const validateForm = () => {
        if (!formData.name || !formData.price || !formData.categoryId) {
            alert('Please fill in all required fields');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            if (selectedProduct) {
                const response = await axios.put(`http://localhost:8080/api/products/${selectedProduct.id}`, formData);
                setProducts(products.map(product =>
                    product.id === selectedProduct.id
                        ? response.data
                        : product
                ));
            } else {
                const response = await axios.post('http://localhost:8080/api/products', formData);
                setProducts([...products, response.data]);
            }
            setOpenDialog(false);
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const renderCategoryName = (category) => {
        const pathParts = category.displayName.split(' → ');
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                {pathParts.map((part, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                        <Typography
                            variant="body2"
                            component="span"
                            sx={{
                                color: index === pathParts.length - 1 ? 'text.primary' : 'text.secondary',
                                fontWeight: index === pathParts.length - 1 ? 500 : 400
                            }}
                        >
                            {part}
                        </Typography>
                    </React.Fragment>
                ))}
            </Box>
        );
    };

    return (
        <Box sx={{ mt: -10 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Products Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                >
                    Add Product
                </Button>
            </Box>

            {/* Search and Filter Controls */}
            <Box 
                sx={{ 
                    display: 'flex',
                    gap: 2,
                    mb: 3,
                    flexDirection: { xs: 'column', sm: 'row' }
                }}
            >
                <TextField
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ 
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            borderRadius: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            },
                            '&.Mui-focused': {
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            }
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <FormControl
                    sx={{
                        minWidth: { xs: '100%', sm: 280 },
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            borderRadius: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            },
                            '&.Mui-focused': {
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            }
                        }
                    }}
                >
                    <InputLabel>Filter by Category</InputLabel>
                    <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        label="Filter by Category"
                        displayEmpty
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        {flattenCategories(categories).map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {renderCategoryName(category)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                    overflow: 'hidden'
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Image</StyledTableCell>
                            <StyledTableCell>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleSort('name')}
                                >
                                    Name
                                    <SortIcon sx={{
                                        ml: 0.5,
                                        transform: sortField === 'name' && sortDirection === 'desc' ? 'rotate(180deg)' : 'none'
                                    }} />
                                </Box>
                            </StyledTableCell>
                            <StyledTableCell>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleSort('category')}
                                >
                                    Category
                                    <SortIcon sx={{
                                        ml: 0.5,
                                        transform: sortField === 'category' && sortDirection === 'desc' ? 'rotate(180deg)' : 'none'
                                    }} />
                                </Box>
                            </StyledTableCell>
                            <StyledTableCell>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleSort('price')}
                                >
                                    Price
                                    <SortIcon sx={{
                                        ml: 0.5,
                                        transform: sortField === 'price' && sortDirection === 'desc' ? 'rotate(180deg)' : 'none'
                                    }} />
                                </Box>
                            </StyledTableCell>
                            <StyledTableCell>Stock</StyledTableCell>
                            <StyledTableCell>Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : paginatedProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="text.secondary">
                                        No products found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedProducts.map((product) => (
                                <TableRow
                                    key={product.id}
                                    sx={{ '&:hover': { backgroundColor: 'grey.50' } }}
                                >
                                    <TableCell>
                                        <img
                                            src={product.images && product.images[0]
                                                ? `data:${product.images[0].imageType};base64,${product.images[0].imageBase64}`
                                                : '/default-product-image.jpg'}
                                            alt={product.name}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.categoryName}</TableCell>
                                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                    <TableCell>
                                        {product.stocks ?
                                            product.stocks.reduce((total, stock) =>
                                                total + (Number(stock.stock) || 0), 0)
                                            : 0}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => handleEdit(product)}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleStockManagement(product)}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            <InventoryIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleImageManagement(product)}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            <ImagesIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(product.id)}
                                            size="small"
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredProducts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <CommonDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                title={selectedProduct ? 'Edit Product' : 'Add Product'}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                type="product"
            />

            <StockManagementDialog
                open={openStockDialog}
                onClose={() => setOpenStockDialog(false)}
                product={selectedProduct}
                onSave={handleSaveStocks}
            />

            <ImageManagementDialog
                open={openImageDialog}
                onClose={() => setOpenImageDialog(false)}
                product={selectedProduct}
                onSave={(images) => {
                    setProducts(products.map(product =>
                        product.id === selectedProduct.id
                            ? { ...product, images }
                            : product
                    ));
                    setOpenImageDialog(false);
                }}
            />
        </Box>
    );
};

export default Products;