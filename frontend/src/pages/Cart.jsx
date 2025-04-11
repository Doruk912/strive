import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardMedia,
    IconButton,
    Button,
    Divider,
    TextField,
    useMediaQuery,
    useTheme,
    CircularProgress,
    Collapse,
    Fade,
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import {Helmet} from "react-helmet";

const Cart = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, loading } = useCart();
    const [removingItems, setRemovingItems] = useState(new Set());

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity >= 1) {
            await updateQuantity(productId, newQuantity);
        }
    };

    const handleRemoveItem = async (productId, selectedSize) => {
        setRemovingItems(prev => new Set(prev).add(productId));
        await removeFromCart(productId, selectedSize);
        setRemovingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
        });
    };

    const cartTotals = getCartTotal();

    return (
        <>
            <Helmet>
                <title>Strive - Cart</title>
            </Helmet>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Shopping Cart
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography color="text.secondary">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/products')}
                        sx={{ ml: 2 }}
                    >
                        Continue Shopping
                    </Button>
                </Box>

                <Grid container spacing={4}>
                    {/* Cart Items */}
                    <Grid item xs={12} md={8}>
                        {cartItems.length === 0 ? (
                            <Fade in={true}>
                                <Card sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Your cart is empty
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/products')}
                                        sx={{ mt: 2 }}
                                    >
                                        Continue Shopping
                                    </Button>
                                </Card>
                            </Fade>
                        ) : (
                            cartItems.map((item) => (
                                <Collapse key={item.id} in={!removingItems.has(item.id)}>
                                    <Card
                                        sx={{
                                            mb: 2,
                                            display: 'flex',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            alignItems: isMobile ? 'stretch' : 'center',
                                            p: 2,
                                            position: 'relative',
                                        }}
                                    >
                                        {loading && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                                    zIndex: 1,
                                                }}
                                            >
                                                <CircularProgress />
                                            </Box>
                                        )}

                                        <CardMedia
                                            component="img"
                                            image={item.image || '/default-product-image.jpg'}
                                            alt={item.name}
                                            sx={{
                                                width: isMobile ? '100%' : 120,
                                                height: isMobile ? 200 : 120,
                                                objectFit: 'cover',
                                                borderRadius: 1
                                            }}
                                        />

                                        <Box
                                            sx={{
                                                flex: 1,
                                                ml: isMobile ? 0 : 2,
                                                mt: isMobile ? 2 : 0,
                                            }}
                                        >
                                            <Typography variant="h6" gutterBottom>
                                                {item.name}
                                            </Typography>
                                            <Typography color="text.secondary" gutterBottom>
                                                ${item.price}
                                            </Typography>
                                            <Typography color="text.secondary" gutterBottom>
                                                Size: {item.selectedSize}
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1 || loading}
                                                    >
                                                        <RemoveIcon />
                                                    </IconButton>
                                                    <TextField
                                                        size="small"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const value = parseInt(e.target.value) || 0;
                                                            handleQuantityChange(item.id, value);
                                                        }}
                                                        disabled={loading}
                                                        sx={{
                                                            width: 60,
                                                            '& .MuiOutlinedInput-root': {
                                                                '& fieldset': {
                                                                    border: 'none',
                                                                },
                                                            },
                                                        }}
                                                        inputProps={{
                                                            min: 1,
                                                            style: { textAlign: 'center' },
                                                            'aria-label': 'quantity'
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        disabled={loading || item.quantity >= (item.stocks?.reduce((total, stock) => total + (stock.stock || 0), 0) || 0)}
                                                    >
                                                        <AddIcon />
                                                    </IconButton>
                                                </Box>

                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleRemoveItem(item.id, item.selectedSize)}
                                                    disabled={loading}
                                                    sx={{ ml: 'auto' }}
                                                    aria-label="remove item"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Card>
                                </Collapse>
                            ))
                        )}
                    </Grid>

                    {/* Order Summary */}
                    <Grid item xs={12} md={4}>
                        <Fade in={true}>
                            <Card sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Order Summary
                                </Typography>
                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ mb: 2 }}>
                                    <Grid container justifyContent="space-between">
                                        <Grid item>
                                            <Typography>Products</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography>${cartTotals.subtotal.toFixed(2)}</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Grid container justifyContent="space-between">
                                        <Grid item>
                                            <Typography>Shipping</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography>Free</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ mb: 3 }}>
                                    <Grid container justifyContent="space-between">
                                        <Grid item>
                                            <Typography variant="h6">Total</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6">
                                                ${cartTotals.subtotal.toFixed(2)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    onClick={() => navigate('/checkout')}
                                    disabled={cartItems.length === 0 || loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Proceed to Checkout'}
                                </Button>
                            </Card>
                        </Fade>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default Cart;