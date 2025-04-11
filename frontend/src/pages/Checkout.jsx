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
import CheckoutAddressForm from '../components/CheckoutAddressForm';
import CheckoutAddressDialog from '../components/CheckoutAddressDialog';
import CheckoutCardForm from '../components/CheckoutCardForm';

const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [showNewAddressDialog, setShowNewAddressDialog] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardholderName: '',
        expiryDate: '',
        cvv: ''
    });
    const [cardErrors, setCardErrors] = useState({});

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
                    setSelectedAddress(defaultAddress);
                }
            } catch (error) {
                setError('Failed to load addresses');
                console.error('Error fetching addresses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, [user, navigate]);

    const handleNext = () => {
        if (activeStep === 1) {
            // Validate card details before proceeding to review
            if (!validateCardDetails()) {
                setError('Please check your card details');
                return;
            }
            // Clear error if validation passes
            setError(null);
        }
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
    };

    const handleNewAddressSelect = (address) => {
        if (address.id) {
            setAddresses(prevAddresses => [...prevAddresses, address]);
        }
        setSelectedAddress(address);
        setShowNewAddressDialog(false);
    };

    const handleCardDetailsChange = (field, value) => {
        setCardDetails(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (cardErrors[field]) {
            setCardErrors(prev => ({
                ...prev,
                [field]: false
            }));
        }
    };

    const validateExpiryDate = (date) => {
        if (!date) return false;
        
        // Check format (MM/YY)
        const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!regex.test(date)) return false;
        
        // Parse the date
        const [month, year] = date.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const currentDate = new Date();
        
        // Set both dates to the first of the month for comparison
        currentDate.setDate(1);
        currentDate.setHours(0, 0, 0, 0);
        
        return expiryDate >= currentDate;
    };

    const validateCardDetails = () => {
        const errors = {};
        const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
        
        if (!cleanCardNumber || cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
            errors.cardNumber = true;
        }
        if (!cardDetails.cardholderName.trim()) {
            errors.cardholderName = true;
        }
        if (!cardDetails.expiryDate || !validateExpiryDate(cardDetails.expiryDate)) {
            errors.expiryDate = true;
        }
        if (!cardDetails.cvv || cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
            errors.cvv = true;
        }

        setCardErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProceedToPayment = async () => {
        if (!selectedAddress) {
            setError('Please select or enter a shipping address');
            return;
        }

        if (!validateCardDetails()) {
            setError('Please check your card details');
            return;
        }

        try {
            setLoading(true);
            if (!user || !user.userId) {
                throw new Error('User not logged in');
            }

            const orderData = {
                userId: user.userId,
                addressId: selectedAddress.id,
                totalAmount: getCartTotal().total,
                paymentMethod: 'credit_card',
                cardLastFour: cardDetails.cardNumber.slice(-4),
                cardExpiry: cardDetails.expiryDate,
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    size: item.selectedSize,
                    price: item.price
                }))
            };

            const response = await fetch('http://localhost:8080/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create order');
            }

            await response.json();
            clearCart();
            navigate('/order-confirmation');
        } catch (err) {
            setError('Failed to process order: ' + err.message);
            console.error('Error processing order:', err);
        } finally {
            setLoading(false);
        }
    };

    const cartTotals = getCartTotal();

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
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
                        {activeStep === 0 && (
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Shipping Address
                                    </Typography>

                                    {addresses.length > 0 && (
                                        <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
                                            <FormLabel component="legend">Select Address</FormLabel>
                                            <RadioGroup>
                                                {addresses.map((address) => (
                                                    <Card
                                                        key={address.id}
                                                        sx={{
                                                            mb: 2,
                                                            cursor: 'pointer',
                                                            border: selectedAddress?.id === address.id ? '2px solid' : '1px solid',
                                                            borderColor: selectedAddress?.id === address.id ? 'primary.main' : 'divider',
                                                            '&:hover': {
                                                                borderColor: 'primary.main',
                                                            },
                                                        }}
                                                        onClick={() => handleAddressSelect(address)}
                                                    >
                                                        <CardContent>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                                <FormControlLabel
                                                                    value={address.id.toString()}
                                                                    control={
                                                                        <Radio
                                                                            checked={selectedAddress?.id === address.id}
                                                                            onChange={() => handleAddressSelect(address)}
                                                                        />
                                                                    }
                                                                    label={
                                                                        <Typography variant="subtitle1">
                                                                            {address.name}
                                                                            {address.isDefault && (
                                                                                <Typography
                                                                                    component="span"
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
                                                                        </Typography>
                                                                    }
                                                                />
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
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    )}

                                    {selectedAddress && !addresses.some(addr => addr.id === selectedAddress.id) && (
                                        <Card
                                            sx={{
                                                mb: 2,
                                                border: '2px solid',
                                                borderColor: 'primary.main',
                                            }}
                                        >
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="subtitle1">
                                                        New Address
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedAddress.recipientName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedAddress.recipientPhone}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedAddress.streetAddress}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedAddress.country}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <Button
                                        variant="outlined"
                                        onClick={() => setShowNewAddressDialog(true)}
                                        sx={{ mb: 2 }}
                                    >
                                        Enter New Address
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                        {activeStep === 1 && (
                            <Card sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Payment Method
                                </Typography>
                                <CheckoutCardForm
                                    onCardDetailsChange={handleCardDetailsChange}
                                    errors={cardErrors}
                                />
                            </Card>
                        )}
                        {activeStep === 2 && (
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
                                                {selectedAddress.recipientName}
                                            </Typography>
                                            <Typography variant="body2">
                                                {selectedAddress.recipientPhone}
                                            </Typography>
                                            <Typography variant="body2">
                                                {selectedAddress.streetAddress}
                                            </Typography>
                                            <Typography variant="body2">
                                                {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                                            </Typography>
                                            <Typography variant="body2">
                                                {selectedAddress.country}
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
                                            Credit Card ending in {cardDetails.cardNumber.slice(-4)}
                                        </Typography>
                                        <Typography variant="body2">
                                            Expires: {cardDetails.expiryDate}
                                        </Typography>
                                    </Paper>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Order Summary
                                    </Typography>
                                    {cartItems.map((item) => (
                                        <Box 
                                            key={`${item.id}-${item.selectedSize}`} 
                                            sx={{ 
                                                mb: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2
                                            }}
                                        >
                                            <Box sx={{ width: 80, height: 80, position: 'relative' }}>
                                                <img
                                                    src={item.image || '/default-product-image.jpg'}
                                                    alt={item.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Size: {item.selectedSize} x {item.quantity}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography>Subtotal</Typography>
                                    <Typography>${cartTotals.subtotal.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography>Shipping</Typography>
                                    <Typography>Free</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h6">Total</Typography>
                                    <Typography variant="h6">${cartTotals.total.toFixed(2)}</Typography>
                                </Box>
                            </Card>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                onClick={activeStep === steps.length - 1 ? handleProceedToPayment : handleNext}
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
                                <Typography>${cartTotals.subtotal.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Shipping</Typography>
                                <Typography>Free</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6">Total</Typography>
                                <Typography variant="h6">${cartTotals.total.toFixed(2)}</Typography>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>

                <CheckoutAddressDialog
                    open={showNewAddressDialog}
                    onClose={() => setShowNewAddressDialog(false)}
                    onAddressSelect={handleNewAddressSelect}
                    user={user}
                />
            </Container>
        </>
    );
};

export default Checkout;