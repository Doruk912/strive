import React from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Box,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { state, dispatch } = useCart();
    const navigate = useNavigate();

    const handleUpdateQuantity = (item, change) => {
        const newQuantity = item.quantity + change;
        if (newQuantity < 1) {
            dispatch({ type: 'REMOVE_FROM_CART', payload: item.id });
        } else {
            dispatch({
                type: 'UPDATE_QUANTITY',
                payload: { id: item.id, quantity: newQuantity },
            });
        }
    };

    const getTotalPrice = () => {
        return state.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Shopping Cart
            </Typography>

            {state.items.length === 0 ? (
                <Box sx={{ textAlign: 'center', my: 4 }}>
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
                </Box>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {state.items.map((item) => (
                            <Grid item xs={12} key={item.id}>
                                <Card>
                                    <CardContent>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} sm={3}>
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    style={{ width: '100%', height: 'auto' }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <Typography variant="h6">{item.name}</Typography>
                                                <Typography color="text.secondary">
                                                    ${item.price}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <IconButton
                                                        onClick={() => handleUpdateQuantity(item, -1)}
                                                    >
                                                        <RemoveIcon />
                                                    </IconButton>
                                                    <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                                                    <IconButton
                                                        onClick={() => handleUpdateQuantity(item, 1)}
                                                    >
                                                        <AddIcon />
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={2}>
                                                <Typography variant="h6">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={1}>
                                                <IconButton
                                                    onClick={() =>
                                                        dispatch({
                                                            type: 'REMOVE_FROM_CART',
                                                            payload: item.id,
                                                        })
                                                    }
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ mt: 4, textAlign: 'right' }}>
                        <Typography variant="h5" gutterBottom>
                            Total: ${getTotalPrice().toFixed(2)}
                        </Typography>
                        <Button variant="contained" size="large">
                            Proceed to Checkout
                        </Button>
                    </Box>
                </>
            )}
        </Container>
    );
};

export default Cart;