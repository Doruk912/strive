import React from 'react';
import {
    Container,
    Paper,
    Typography,
    Button,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                    Order Confirmed!
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    Thank you for your purchase. Your order has been received and will be processed shortly.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{ mr: 2 }}
                >
                    Continue Shopping
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/profile')}
                >
                    View Orders
                </Button>
            </Paper>
        </Container>
    );
};

export default OrderConfirmation;