import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {Helmet} from "react-helmet";

const OrderConfirmation = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>Strive - Order Confirmation</title>
            </Helmet>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <CheckCircleIcon 
                            sx={{ 
                                fontSize: 60, 
                                color: '#4CAF50',
                                mb: 2 
                            }} 
                        />
                        <Typography variant="h4" gutterBottom>
                            Thank You for Your Order!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Your order has been successfully placed. You will receive a confirmation email shortly.
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/products')}
                                sx={{ mr: 2 }}
                            >
                                Continue Shopping
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/orders')}
                            >
                                View Orders
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </>
    );
};

export default OrderConfirmation;