import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addressService } from '../services/addressService';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    Paper,
    Divider,
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    CreditCard as CreditCardIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {Helmet} from "react-helmet";

const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchAddresses = async () => {
            try {
                setLoading(true);
                const userAddresses = await addressService.getUserAddresses(user.userId, user.token);
                setAddresses(userAddresses);
                const defaultAddress = userAddresses.find(addr => addr.isDefault);
                if (defaultAddress) {
                    setSelectedAddress(defaultAddress.id);
                }
            } catch (err) {
                setError('Failed to load addresses');
                console.error('Error fetching addresses:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, [user, navigate]);

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleAddressChange = (event) => {
        setSelectedAddress(parseInt(event.target.value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAddress) {
            setError('Please select a shipping address');
            return;
        }

        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw new Error('User not logged in');
            }

            const selectedAddressData = addresses.find(addr => addr.id === selectedAddress);
            if (!selectedAddressData) {
                throw new Error('Please select a valid address');
            }

            const orderData = {
                userId: parseInt(userId),
                addressId: selectedAddressData.id,
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    size: item.selectedSize,
                    price: item.price
                })),
                paymentMethod,
                total: getCartTotal().total
            };

            await new Promise(resolve => setTimeout(resolve, 1000));
            clearCart();
            navigate('/order-confirmation');
        } catch (err) {
            setError('Failed to process order');
            console.error('Error processing order:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderAddressStep = () => (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Select Shipping Address
            </Typography>
            <Button
                variant="outlined"
                onClick={() => navigate('/profile')}
                sx={{ mb: 3 }}
            >
                Manage Addresses
            </Button>

            <RadioGroup
                value={selectedAddress}
                onChange={handleAddressChange}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                {addresses.map((address) => (
                    <Paper
                        key={address.id}
                        elevation={selectedAddress === address.id ? 3 : 1}
                        sx={{
                            p: 2,
                            cursor: 'pointer',
                            border: selectedAddress === address.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: '#1976d2',
                            },
                        }}
                    >
                        <FormControlLabel
                            value={address.id}
                            control={<Radio />}
                            label={
                                <Box sx={{ ml: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                            {address.name}
                                        </Typography>
                                        {address.isDefault && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    ml: 1,
                                                    px: 1,
                                                    py: 0.5,
                                                    bgcolor: 'primary.light',
                                                    color: 'primary.main',
                                                    borderRadius: 1,
                                                }}
                                            >
                                                Default
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {address.recipientName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {address.recipientPhone}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {address.streetAddress}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {address.city}, {address.state} {address.postalCode}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {address.country}
                                    </Typography>
                                </Box>
                            }
                            sx={{ width: '100%', m: 0 }}
                        />
                    </Paper>
                ))}
            </RadioGroup>
        </Card>
    );

    const renderPaymentStep = () => (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Payment Method
            </Typography>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <Paper
                        elevation={paymentMethod === 'credit_card' ? 3 : 1}
                        sx={{
                            p: 2,
                            cursor: 'pointer',
                            border: paymentMethod === 'credit_card' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: '#1976d2',
                            },
                        }}
                    >
                        <FormControlLabel
                            value="credit_card"
                            control={<Radio />}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CreditCardIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography>Credit Card</Typography>
                                </Box>
                            }
                            sx={{ width: '100%', m: 0 }}
                        />
                    </Paper>
                    <Paper
                        elevation={paymentMethod === 'paypal' ? 3 : 1}
                        sx={{
                            p: 2,
                            cursor: 'pointer',
                            border: paymentMethod === 'paypal' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: '#1976d2',
                            },
                        }}
                    >
                        <FormControlLabel
                            value="paypal"
                            control={<Radio />}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CreditCardIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography>PayPal</Typography>
                                </Box>
                            }
                            sx={{ width: '100%', m: 0 }}
                        />
                    </Paper>
                </RadioGroup>
            </FormControl>
        </Card>
    );

    const renderReviewStep = () => (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Review Your Order
            </Typography>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Shipping Address
                </Typography>
                {selectedAddress && (
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="body2">
                            {addresses.find(addr => addr.id === selectedAddress)?.recipientName}
                        </Typography>
                        <Typography variant="body2">
                            {addresses.find(addr => addr.id === selectedAddress)?.recipientPhone}
                        </Typography>
                        <Typography variant="body2">
                            {addresses.find(addr => addr.id === selectedAddress)?.streetAddress}
                        </Typography>
                        <Typography variant="body2">
                            {addresses.find(addr => addr.id === selectedAddress)?.city}, {addresses.find(addr => addr.id === selectedAddress)?.state} {addresses.find(addr => addr.id === selectedAddress)?.postalCode}
                        </Typography>
                        <Typography variant="body2">
                            {addresses.find(addr => addr.id === selectedAddress)?.country}
                        </Typography>
                    </Paper>
                )}
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Payment Method
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2">
                        {paymentMethod === 'credit_card' ? 'Credit Card' : 'PayPal'}
                    </Typography>
                </Paper>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Order Summary
                </Typography>
                {cartItems.map((item) => (
                    <Box key={`${item.id}-${item.selectedSize}`} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                            {item.name} - Size: {item.selectedSize} x {item.quantity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Subtotal</Typography>
                <Typography>${getCartTotal().subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Shipping</Typography>
                <Typography>Free</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">${getCartTotal().total.toFixed(2)}</Typography>
            </Box>
        </Card>
    );

    if (cartItems.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Your cart is empty
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/products')}
                            sx={{ mt: 2 }}
                        >
                            Continue Shopping
                        </Button>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <>
            <Helmet>
                <title>Strive - Checkout</title>
            </Helmet>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        {activeStep === 0 && renderAddressStep()}
                        {activeStep === 1 && renderPaymentStep()}
                        {activeStep === 2 && renderReviewStep()}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                                disabled={loading || (activeStep === 0 && !selectedAddress)}
                            >
                                {loading ? <CircularProgress size={24} /> : 
                                 activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
                            </Button>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Order Summary
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            {cartItems.map((item) => (
                                <Box key={`${item.id}-${item.selectedSize}`} sx={{ mb: 2 }}>
                                    <Typography variant="body2">
                                        {item.name} - Size: {item.selectedSize}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.quantity} x ${item.price.toFixed(2)}
                                    </Typography>
                                </Box>
                            ))}

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Subtotal</Typography>
                                <Typography>${getCartTotal().subtotal.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Shipping</Typography>
                                <Typography>Free</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6">Total</Typography>
                                <Typography variant="h6">${getCartTotal().total.toFixed(2)}</Typography>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default Checkout;