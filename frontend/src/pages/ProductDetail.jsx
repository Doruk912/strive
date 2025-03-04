import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
    Container,
    Grid,
    Typography,
    Box,
    Button,
    IconButton,
    Rating,
    Divider,
    Breadcrumbs,
    Link,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    FavoriteBorder as FavoriteBorderIcon,
    Favorite as FavoriteIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { products } from '../mockData/Products';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import Dialog from '@mui/material/Dialog';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems } = useCart();
    const product = products.find(p => p.id === parseInt(id));
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const isInCart = cartItems.some(item => item.id === product?.id);

    if (!product) {
        return (
            <Container>
                <Typography>Product not found</Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/shop')}
                    sx={{ mt: 2 }}
                >
                    Return to Shop
                </Button>
            </Container>
        );
    }

    const handleAddToCart = () => {
        if (!isInCart) {
            addToCart(product, quantity);
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 4 }}
            >
                <Link
                    component="button"
                    onClick={() => navigate('/')}
                    color="inherit"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                    Home
                </Link>
                <Link
                    component="button"
                    onClick={() => navigate('/shop')}
                    color="inherit"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                    Shop
                </Link>
                <Typography color="text.primary">{product.name}</Typography>
            </Breadcrumbs>

            <Grid container spacing={4}>
                {/* Product Image */}
                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            width: '100%',
                            height: { xs: '300px', md: '500px' },
                            position: 'relative',
                            backgroundColor: '#f5f5f5',
                            overflow: 'hidden',
                        }}
                    >
                        <img
                            src={product.image}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                            }}
                        />
                    </Box>
                </Grid>

                {/* Product Details */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ position: 'relative' }}>
                        <IconButton
                            onClick={() => setIsFavorite(!isFavorite)}
                            sx={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                },
                            }}
                        >
                            {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                        </IconButton>

                        <Typography variant="h4" component="h1" gutterBottom>
                            {product.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating value={product.rating} readOnly precision={0.5} />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                ({product.rating} / 5)
                            </Typography>
                        </Box>

                        <Typography variant="h5" sx={{ mb: 2 }}>
                            ${product.price}
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 3 }}>
                            {product.description}
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Category: <span style={{ color: '#666' }}>{product.category}</span>
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Status: <span style={{
                                color: product.status === 'active' ? '#4caf50' : '#f44336',
                                fontWeight: 500
                            }}>
                                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                </span>
                            </Typography>
                            <Typography variant="subtitle1">
                                Stock: <span style={{ color: '#666' }}>{product.stock} units</span>
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Quantity Selector and Add to Cart Button */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <FormControl sx={{ width: 100 }}>
                                <InputLabel>Qty</InputLabel>
                                <Select
                                    value={quantity}
                                    label="Qty"
                                    onChange={(e) => setQuantity(e.target.value)}
                                >
                                    {[...Array(Math.min(10, product.stock))].map((_, i) => (
                                        <MenuItem key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || isInCart}
                                sx={{
                                    backgroundColor: '#000',
                                    '&:hover': {
                                        backgroundColor: '#333',
                                    },
                                    '&:disabled': {
                                        backgroundColor: '#ccc',
                                    },
                                }}
                            >
                                {product.stock === 0 ? 'Out of Stock' : isInCart ? 'Already in Cart' : 'Add to Cart'}
                            </Button>
                        </Box>

                        {/* Additional Product Information */}
                        <Typography variant="body2" color="text.secondary">
                            Free shipping on orders over $50
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            <Dialog
                open={openSnackbar}
                onClose={handleCloseSnackbar}
                TransitionComponent={Slide}
                TransitionProps={{
                    direction: "left"
                }}
                PaperProps={{
                    sx: {
                        position: 'fixed',
                        right: 0,
                        top: 0,
                        height: '100%',
                        m: 0,
                        width: { xs: '100%', sm: 400 },
                        borderRadius: 0,
                        bgcolor: '#fff',
                        boxShadow: '-4px 0 10px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <Box sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#fff'
                }}>
                    {/* Header */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 4,
                        pb: 2,
                        borderBottom: '1px solid #eee'
                    }}>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                color: '#111'
                            }}
                        >
                            Added to Cart Successfully
                        </Typography>
                        <IconButton
                            onClick={handleCloseSnackbar}
                            sx={{
                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Product Info */}
                    <Box sx={{
                        display: 'flex',
                        gap: 3,
                        mb: 4,
                        backgroundColor: '#f8f8f8',
                        p: 2,
                        borderRadius: 1
                    }}>
                        <Box
                            sx={{
                                width: 120,
                                height: 120,
                                backgroundColor: '#fff',
                                overflow: 'hidden',
                                borderRadius: 1,
                                border: '1px solid #eee'
                            }}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    mb: 1,
                                    color: '#111'
                                }}
                            >
                                {product.name}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.95rem',
                                    color: '#666',
                                    mb: 1
                                }}
                            >
                                Quantity: {quantity}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: '#111'
                                }}
                            >
                                ${product.price}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Cart Summary */}
                    <Box sx={{
                        mb: 4,
                        p: 2,
                        backgroundColor: '#f8f8f8',
                        borderRadius: 1
                    }}>
                        <Typography
                            sx={{
                                fontSize: '0.9rem',
                                color: '#666',
                                mb: 1
                            }}
                        >
                            Cart Summary
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 1
                        }}>
                            <Typography sx={{ fontSize: '1rem' }}>
                                Subtotal ({quantity} items)
                            </Typography>
                            <Typography sx={{
                                fontSize: '1rem',
                                fontWeight: 600
                            }}>
                                ${(product.price * quantity).toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Buttons */}
                    <Box sx={{
                        mt: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => {
                                navigate('/cart');
                                handleCloseSnackbar();
                            }}
                            sx={{
                                backgroundColor: '#000',
                                color: '#fff',
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 500,
                                '&:hover': {
                                    backgroundColor: '#333',
                                }
                            }}
                        >
                            View Cart
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleCloseSnackbar}
                            sx={{
                                borderColor: '#000',
                                color: '#000',
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 500,
                                '&:hover': {
                                    borderColor: '#333',
                                    backgroundColor: 'rgba(0,0,0,0.04)',
                                }
                            }}
                        >
                            Continue Shopping
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </Container>
    );
};

export default ProductDetail;