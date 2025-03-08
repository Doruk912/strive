import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const mockOrders = [
            {
                id: "ORD001",
                date: "2024-01-15",
                status: "Delivered",
                items: [
                    {
                        id: 1,
                        name: "Nike Air Max",
                        quantity: 1,
                        price: 129.99,
                        image: "shoe1.jpg"
                    },
                    {
                        id: 2,
                        name: "Sports T-Shirt",
                        quantity: 2,
                        price: 29.99,
                        image: "tshirt1.jpg"
                    }
                ],
                total: 189.97,
                shippingAddress: "123 Main St, City, Country",
                paymentMethod: "Credit Card"
            },
            {
                id: "ORD002",
                date: "2024-01-10",
                status: "Processing",
                items: [
                    {
                        id: 3,
                        name: "Basketball",
                        quantity: 1,
                        price: 24.99,
                        image: "ball1.jpg"
                    }
                ],
                total: 24.99,
                shippingAddress: "456 Oak St, City, Country",
                paymentMethod: "PayPal"
            },
            {
                id: "ORD003",
                date: "2024-01-05",
                status: "Delivered",
                items: [
                    {
                        id: 4,
                        name: "Running Shorts",
                        quantity: 2,
                        price: 34.99,
                        image: "shorts1.jpg"
                    },
                    {
                        id: 5,
                        name: "Sports Socks",
                        quantity: 3,
                        price: 9.99,
                        image: "socks1.jpg"
                    },
                    {
                        id: 6,
                        name: "Water Bottle",
                        quantity: 1,
                        price: 14.99,
                        image: "bottle1.jpg"
                    }
                ],
                total: 104.94,
                shippingAddress: "789 Pine St, City, Country",
                paymentMethod: "Credit Card"
            }
        ];
        // Simulate API call with mock data
        const fetchOrders = async () => {
            try {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                setOrders(mockOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return 'success';
            case 'Processing':
                return 'warning';
            case 'Cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Container maxWidth="md" sx={{mb: 4 }}>
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    fontWeight: 600,
                    color: 'primary.main'
                }}
            >
                My Orders
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {orders.length > 0 ? (
                <List>
                    {orders.map((order) => (
                        <Paper
                            key={order.id}
                            sx={{
                                mb: 3,
                                overflow: 'hidden',
                                borderRadius: 2,
                                border: '1px solid rgba(0, 0, 0, 0.12)'
                            }}
                            elevation={1}
                        >
                            <ListItem
                                sx={{
                                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                                    py: 2,
                                }}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {`Order ${order.id}`}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(order.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={order.status}
                                    color={getStatusColor(order.status)}
                                    size="small"
                                    sx={{ ml: 2 }}
                                />
                            </ListItem>

                            {order.items.map((item) => (
                                <ListItem
                                    key={item.id}
                                    sx={{
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                                        py: 2,
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2">
                                                {item.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary">
                                                Quantity: {item.quantity}
                                            </Typography>
                                        }
                                    />
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </Typography>
                                </ListItem>
                            ))}

                            <Box
                                sx={{
                                    p: 2,
                                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Shipping Address:
                                    </Typography>
                                    <Typography variant="body2">
                                        {order.shippingAddress}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Payment Method:
                                    </Typography>
                                    <Typography variant="body2">
                                        {order.paymentMethod}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Order Total
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: 'primary.main',
                                            fontWeight: 600
                                        }}
                                    >
                                        ${order.total.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </List>
            ) : (
                <Paper
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    }}
                >
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                    >
                        No Orders Yet
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        When you place orders, they will appear here.
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default Orders;