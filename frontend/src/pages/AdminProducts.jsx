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
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Inventory as InventoryIcon,
    Collections as ImagesIcon
} from '@mui/icons-material';
import StockManagementDialog from '../components/StockManagementDialog';
import CommonDialog from '../components/AdminDialog';
import ImageManagementDialog from '../components/ImageManagementDialog';
import {styled} from "@mui/material/styles";
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
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        status: 'ACTIVE',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            console.log('Fetching products...');
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/products');
            console.log('Products received:', response.data);
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
        } finally {
            setLoading(false);
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
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>Category</StyledTableCell>
                            <StyledTableCell>Price</StyledTableCell>
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
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="text.secondary">
                                        No products found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
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