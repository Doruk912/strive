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
    CircularProgress,
    Alert,
    Grid,
    Card,
    CardMedia,
    useTheme,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { LocalShipping, CheckCircle, Cancel, Pending, Inventory } from '@mui/icons-material';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productDetails, setProductDetails] = useState({});
    const theme = useTheme();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8080/api/orders/user/${user.userId}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data);

                // Get unique product IDs from all orders
                const productIds = new Set();
                data.forEach(order => {
                    order.items.forEach(item => {
                        productIds.add(item.productId);
                    });
                });

                // Fetch product details for all products
                const productDetailsPromises = Array.from(productIds).map(productId =>
                    fetch(`http://localhost:8080/api/products/${productId}`).then(res => res.json())
                );

                const products = await Promise.all(productDetailsPromises);
                const productDetailsMap = {};
                products.forEach(product => {
                    productDetailsMap[product.id] = product;
                });
                setProductDetails(productDetailsMap);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setError('Failed to load orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'DELIVERED':
                return {
                    label: 'Delivered',
                    color: theme.palette.success.main,
                    icon: <CheckCircle />,
                    textColor: theme.palette.success.contrastText,
                    bgColor: theme.palette.success.light
                };
            case 'PROCESSING':
                return {
                    label: 'Processing',
                    color: theme.palette.warning.main,
                    icon: <Inventory />,
                    textColor: theme.palette.warning.contrastText,
                    bgColor: theme.palette.warning.light
                };
            case 'SHIPPED':
                return {
                    label: 'Shipped',
                    color: theme.palette.info.main,
                    icon: <LocalShipping />,
                    textColor: theme.palette.info.contrastText,
                    bgColor: theme.palette.info.light
                };
            case 'CANCELLED':
                return {
                    label: 'Cancelled',
                    color: theme.palette.error.main,
                    icon: <Cancel />,
                    textColor: theme.palette.error.contrastText,
                    bgColor: theme.palette.error.light
                };
            case 'PENDING':
                return {
                    label: 'Pending',
                    color: theme.palette.grey[500],
                    icon: <Pending />,
                    textColor: theme.palette.grey[800],
                    bgColor: theme.palette.grey[200]
                };
            default:
                return {
                    label: status,
                    color: theme.palette.grey[500],
                    icon: null,
                    textColor: theme.palette.grey[800],
                    bgColor: theme.palette.grey[200]
                };
        }
    };

    const formatPaymentMethod = (method) => {
        if (method === 'credit_card') {
            return 'Card';
        }
        return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 3
                }}
            >
                My Orders
            </Typography>

            {orders.length > 0 ? (
                <Grid container spacing={3}>
                    {orders.map((order) => {
                        const statusInfo = getStatusInfo(order.status);
                        return (
                            <Grid item xs={12} key={order.id}>
                                <Paper
                                    sx={{
                                        overflow: 'hidden',
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: theme.shadows[2]
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 3,
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: 'background.paper'
                                        }}
                                    >
                                        <Grid container alignItems="center" spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                    Order #{order.id}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: { sm: 'flex-end' } }}>
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    bgcolor: statusInfo.bgColor,
                                                    color: statusInfo.color,
                                                    px: 2,
                                                    py: 1,
                                                    borderRadius: 2
                                                }}>
                                                    {statusInfo.icon}
                                                    <Typography 
                                                        variant="subtitle2" 
                                                        sx={{ 
                                                            ml: 1,
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {statusInfo.label}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Box sx={{ p: 3 }}>
                                        {order.items.map((item) => {
                                            const product = productDetails[item.productId];
                                            return (
                                                <Card
                                                    key={item.id}
                                                    sx={{
                                                        display: 'flex',
                                                        mb: 2,
                                                        boxShadow: 'none',
                                                        bgcolor: 'background.default',
                                                        '&:last-child': { mb: 0 }
                                                    }}
                                                >
                                                    {product?.images?.[0] && (
                                                        <CardMedia
                                                            component="img"
                                                            sx={{
                                                                width: 120,
                                                                height: 120,
                                                                objectFit: 'cover',
                                                                borderRadius: 1
                                                            }}
                                                            image={`data:${product.images[0].imageType};base64,${product.images[0].imageBase64}`}
                                                            alt={product.name}
                                                        />
                                                    )}
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        flexDirection: 'column', 
                                                        flex: 1, 
                                                        p: 2,
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <Box>
                                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                                                {product ? product.name : `Product #${item.productId}`}
                                                            </Typography>
                                                            {product && (
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                                    {product.description}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between',
                                                            alignItems: 'flex-end'
                                                        }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Size: {item.size} | Quantity: {item.quantity}
                                                            </Typography>
                                                            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                                                                ${(item.price * item.quantity).toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Card>
                                            );
                                        })}
                                    </Box>

                                    <Box sx={{ p: 3, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Grid container spacing={2} alignItems="flex-start">
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Shipping Address
                                                </Typography>
                                                {order.orderAddress ? (
                                                    <>
                                                        <Typography variant="body1">
                                                            {order.orderAddress.recipientName}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {order.orderAddress.streetAddress}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {order.orderAddress.city}, {order.orderAddress.state} {order.orderAddress.postalCode}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {order.orderAddress.country}
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Address information not available
                                                    </Typography>
                                                )}
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Payment Method
                                                </Typography>
                                                <Typography variant="body1">
                                                    {formatPaymentMethod(order.paymentMethod)} ending in {order.cardLastFour}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    Expires: {order.cardExpiry}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Box sx={{ p: 3, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Grid container spacing={2} alignItems="flex-end">
                                            <Grid item xs={12}>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        Order Total
                                                    </Typography>
                                                    <Typography
                                                        variant="h4"
                                                        sx={{
                                                            color: 'primary.main',
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        ${order.totalAmount.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            ) : (
                <Paper
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        border: '1px dashed',
                        borderColor: 'divider'
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{ 
                            mb: 1,
                            color: 'text.primary',
                            fontWeight: 600
                        }}
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