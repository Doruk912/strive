import React from 'react';
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
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity >= 1) {
            updateQuantity(productId, newQuantity);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Shopping Cart
            </Typography>

            <Grid container spacing={4}>
                {/* Cart Items */}
                <Grid item xs={12} md={8}>
                    {cartItems.length === 0 ? (
                        <Card sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                Your cart is empty
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/')}
                                sx={{ mt: 2 }}
                            >
                                Continue Shopping
                            </Button>
                        </Card>
                    ) : (
                        cartItems.map((item) => (
                            <Card
                                key={item.id}
                                sx={{
                                    mb: 2,
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    alignItems: isMobile ? 'stretch' : 'center',
                                    p: 2,
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={item.image}
                                    alt={item.name}
                                    sx={{
                                        width: isMobile ? '100%' : 120,
                                        height: isMobile ? 200 : 120,
                                        objectFit: 'cover',
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

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mt: 1,
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
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
                                            sx={{ width: 60, mx: 1 }}
                                            inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                        >
                                            <AddIcon />
                                        </IconButton>

                                        <IconButton
                                            color="error"
                                            onClick={() => removeFromCart(item.id)}
                                            sx={{ ml: 'auto' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Card>
                        ))
                    )}
                </Grid>

                {/* Order Summary */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Summary
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 2 }}>
                            <Grid container justifyContent="space-between">
                                <Grid item>
                                    <Typography>Subtotal</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography>${getCartTotal().toFixed(2)}</Typography>
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
                                        ${getCartTotal().toFixed(2)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={() => navigate('/checkout')}
                            disabled={cartItems.length === 0}
                        >
                            Proceed to Checkout
                        </Button>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Cart;