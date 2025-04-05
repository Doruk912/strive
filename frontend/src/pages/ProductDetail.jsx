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
    InputLabel
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
    const isInCart = cartItems.some(item => item.id === product?.id);
    const isFavorite = favoriteItems.some(item => item.id === product?.id);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/api/products/${id}`);
                setProduct(response.data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setError('Product not found');
                } else {
                    setError('An error occurred while fetching the product');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

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
            setTimeout(() => {
                setOpenSnackbar(false);
            }, 3000);
        }
    };

    const toggleFavorite = () => {
        if (isFavorite) {
            removeFromFavorites(product.id);
        } else {
            addToFavorites(product);
        }
    };

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

                <Grid item xs={12} md={6}>
                    <Box sx={{ position: 'relative' }}>
                        <IconButton
                            onClick={toggleFavorite}
                            sx={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                color: 'black',
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