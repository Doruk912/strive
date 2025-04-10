import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
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
    InputLabel,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    FavoriteBorder as FavoriteBorderIcon,
    Favorite as FavoriteIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import axios from 'axios';
import CartNotification from '../components/CartNotification';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems } = useCart();
    const { favoriteItems, addToFavorites, removeFromFavorites } = useFavorites();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8080/api/products/${id}`);
                setProduct(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching product:', err);
                if (err.response && err.response.status === 404) {
                    setError('Product not found');
                } else {
                    setError('An error occurred while fetching the product');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const isInCart = cartItems.some(item => item.id === product?.id);
    const isFavorite = favoriteItems.some(item => item.id === product?.id);

    const handleAddToCart = () => {
        if (!isInCart && product) {
            addToCart(product, quantity);
            setOpenSnackbar(true);
            setTimeout(() => {
                setOpenSnackbar(false);
            }, 3000);
        }
    };

    const toggleFavorite = () => {
        if (!product) return;
        
        if (isFavorite) {
            removeFromFavorites(product.id);
        } else {
            addToFavorites(product);
        }
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Box sx={{ p: 3 }}>
                    <Alert severity="error">{error}</Alert>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/shop')}
                        sx={{ mt: 2 }}
                    >
                        Return to Shop
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container>
                <Box sx={{ p: 3 }}>
                    <Alert severity="warning">Product not found</Alert>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/shop')}
                        sx={{ mt: 2 }}
                    >
                        Return to Shop
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
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
                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            width: '100%',
                            height: { xs: '300px', md: '500px' },
                            position: 'relative',
                            backgroundColor: '#f5f5f5',
                            overflow: 'hidden',
                            borderRadius: '8px',
                        }}
                    >
                        <img
                            src={product.images && product.images[0]
                                ? `data:${product.images[0].imageType};base64,${product.images[0].imageBase64}`
                                : '/default-product-image.jpg'}
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

                <Grid item xs={12} md={6}>
                    <Box sx={{ position: 'relative' }}>
                        <IconButton
                            onClick={toggleFavorite}
                            sx={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                color: isFavorite ? 'error.main' : 'action.active',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                },
                            }}
                        >
                            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>

                        <Typography variant="h4" component="h1" gutterBottom>
                            {product.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating value={product.rating || 0} readOnly precision={0.5} />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                ({product.rating || 0} / 5)
                            </Typography>
                        </Box>

                        <Typography variant="h5" sx={{ mb: 2 }}>
                            ${Number(product.price).toFixed(2)}
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 3 }}>
                            {product.description}
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Category: <span style={{ color: '#666' }}>{product.categoryName}</span>
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Status: <span style={{
                                    color: product.status === 'ACTIVE' ? '#4caf50' : '#f44336',
                                    fontWeight: 500
                                }}>
                                    {product.status === 'ACTIVE' ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </Typography>
                            <Typography variant="subtitle1">
                                Stock: <span style={{ color: '#666' }}>
                                    {product.stocks ? product.stocks.reduce((total, stock) => total + (stock.stock || 0), 0) : 0} units
                                </span>
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <FormControl sx={{ width: 100 }}>
                                <InputLabel>Qty</InputLabel>
                                <Select
                                    value={quantity}
                                    label="Qty"
                                    onChange={(e) => setQuantity(e.target.value)}
                                >
                                    {[...Array(Math.min(10, product.stock || 0))].map((_, i) => (
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
                                disabled={!product.stock || product.stock === 0 || isInCart || product.status !== 'ACTIVE'}
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
                                {!product.stock || product.stock === 0 ? 'Out of Stock' : 
                                 isInCart ? 'Already in Cart' : 
                                 product.status !== 'ACTIVE' ? 'Currently Unavailable' : 
                                 'Add to Cart'}
                            </Button>
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                            Free shipping on orders over $50
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            <CartNotification
                open={openSnackbar}
                product={product}
                quantity={quantity}
            />
        </Container>
    );
};

export default ProductDetail;