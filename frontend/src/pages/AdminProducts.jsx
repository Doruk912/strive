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
import { adminProducts as initialProducts } from '../mockData/Products';
import {styled} from "@mui/material/styles";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    '&.MuiTableCell-head': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
}));

const Products = () => {
    const [products, setProducts] = useState(initialProducts);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [openStockDialog, setOpenStockDialog] = useState(false);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: '',
    });

    const handleStockManagement = (product) => {
        setSelectedProduct(product);
        setOpenStockDialog(true);
    };

    const handleSaveStocks = (sizes) => {
        setProducts(products.map(product =>
            product.id === selectedProduct.id
                ? { ...product, sizes: sizes }
                : product
        ));
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            stock: '',
            image: '',
        });
        setOpenDialog(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setFormData(product);
        setOpenDialog(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(product => product.id !== id));
        }
    };

    const handleImageManagement = (product) => {
        setSelectedProduct(product);
        setOpenImageDialog(true);
    };

    const validateForm = () => {
        if (!formData.name || !formData.price || !formData.category) {
            alert('Please fill in all required fields');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        const newProduct = {
            ...formData,
            price: Number(formData.price),
            sizes: formData.sizes || [],
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (selectedProduct) {
            setProducts(products.map(product =>
                product.id === selectedProduct.id
                    ? { ...product, ...newProduct, updatedAt: new Date().toISOString() }
                    : product
            ));
        } else {
            setProducts([...products, { ...newProduct, id: products.length + 1 }]);
        }
        setOpenDialog(false);
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
                        {products.map((product) => (
                            <TableRow
                                key={product.id}
                                sx={{ '&:hover': { backgroundColor: 'grey.50' } }}
                            >
                                <TableCell>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        style={{
                                            width: 50,
                                            height: 50,
                                            objectFit: 'cover',
                                            borderRadius: '4px'
                                        }}
                                        onError={(e) => {
                                            e.target.src = '/default-product-image.jpg';
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                <TableCell>
                                    {product.sizes ?
                                        product.sizes.reduce((total, size) =>
                                            total + (Number(size.stock) || 0), 0)
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
                        ))}
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
                }}
            />
        </Box>
    );
};

export default Products;