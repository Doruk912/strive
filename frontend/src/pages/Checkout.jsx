import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    PersonOutline as PersonIcon,
    ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import {Helmet} from "react-helmet";
import CheckoutAddressDialog from '../components/CheckoutAddressDialog';
import CheckoutCardForm from '../components/CheckoutCardForm';

const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod] = useState('credit_card');
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
            setLoading(false);
            // Instead of automatically redirecting, we'll show login options in the render
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

            // Construct order data based on whether we're using a saved address or a new one
            const orderData = {
                userId: user.userId,
                totalAmount: getCartTotal().total,
                paymentMethod: paymentMethod,
                cardLastFour: cardDetails.cardNumber.slice(-4),
                cardExpiry: cardDetails.expiryDate,
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    size: item.selectedSize,
                    price: item.price
                }))
            };

            // If the address is from the user's saved addresses, just send the ID
            // Otherwise, send the full address details
            if (addresses.some(addr => addr.id === selectedAddress.id)) {
                orderData.addressId = selectedAddress.id;
            } else {
                orderData.orderAddress = {
                    name: selectedAddress.name || 'Delivery Address',
                    recipientName: selectedAddress.recipientName,
                    recipientPhone: selectedAddress.recipientPhone,
                    streetAddress: selectedAddress.streetAddress,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    postalCode: selectedAddress.postalCode,
                    country: selectedAddress.country
                };
            }

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

    // Improved render image helper function to handle different image sources
    const renderProductImage = (item) => {
        if (item.images && item.images.length > 0 && item.images[0].imageBase64) {
            // If product has base64 images from API
            return `data:${item.images[0].imageType};base64,${item.images[0].imageBase64}`;
        } else if (item.image) {
            // If product has a direct image URL
            return item.image;
        }
        return '/default-product-image.jpg';
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    // If user is not logged in, show login/signup options
    if (!user) {
        return (
            <>
                <Helmet>
                    <title>Strive - Sign In Required</title>
                </Helmet>
                <Container maxWidth="md" sx={{ py: 6 }}>
                    <Card sx={{ p: 4 }}>
                        <CardContent>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography variant="h4" gutterBottom>
                                    Sign In Required
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Please sign in or create an account to continue with your purchase.
                                </Typography>
                            </Box>
                            
                            <Grid container spacing={3} justifyContent="center">
                                <Grid item xs={12} md={5}>
                                    <Card sx={{ 
                                        p: 3, 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                        }
                                    }}>
                                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                                            <PersonIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
                                            <Typography variant="h6" gutterBottom>
                                                Already have an account?
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Sign in to access your saved addresses and complete your purchase faster.
                                            </Typography>
                                        </Box>
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            fullWidth
                                            onClick={() => navigate('/login', { state: { from: location.pathname } })}
                                        >
                                            Sign In
                                        </Button>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={5}>
                                    <Card sx={{ 
                                        p: 3, 
                                        height: '100%',
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                        }
                                    }}>
                                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                                            <ShoppingBagIcon sx={{ fontSize: 48, mb: 2, color: 'secondary.main' }} />
                                            <Typography variant="h6" gutterBottom>
                                                New to Strive?
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Create an account to track your order history and get exclusive offers.
                                            </Typography>
                                        </Box>
                                        <Button 
                                            variant="outlined" 
                                            color="secondary" 
                                            fullWidth
                                            onClick={() => navigate('/register', { state: { from: location.pathname } })}
                                        >
                                            Create Account
                                        </Button>
                                    </Card>
                                </Grid>
                            </Grid>
                            
                            <Box sx={{ mt: 4, textAlign: 'center' }}>
                                <Button 
                                    variant="text" 
                                    color="inherit"
                                    onClick={() => navigate('/cart')}
                                >
                                    Return to Cart
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Container>
            </>
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
                            <Card sx={{ p: 0, overflow: 'hidden', borderRadius: 2 }}>
                                <Box sx={{ 
                                    p: 3, 
                                    borderBottom: '1px solid', 
                                    borderColor: 'divider',
                                    bgcolor: 'primary.light',
                                    color: 'primary.dark',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <LocationIcon sx={{ mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Shipping Address
                                    </Typography>
                                </Box>
                                
                                <CardContent sx={{ p: 3 }}>
                                    {addresses.length > 0 ? (
                                        <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
                                            <FormLabel component="legend" sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}>
                                                Select a saved address:
                                            </FormLabel>
                                            <RadioGroup>
                                                {addresses.map((address) => (
                                                    <Card
                                                        key={address.id}
                                                        sx={{
                                                            mb: 2,
                                                            cursor: 'pointer',
                                                            border: selectedAddress?.id === address.id ? '2px solid' : '1px solid',
                                                            borderColor: selectedAddress?.id === address.id ? 'primary.main' : 'divider',
                                                            borderRadius: 2,
                                                            transition: 'all 0.2s ease-in-out',
                                                            '&:hover': {
                                                                borderColor: 'primary.main',
                                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                                transform: 'translateY(-2px)'
                                                            },
                                                        }}
                                                        onClick={() => handleAddressSelect(address)}
                                                    >
                                                        <CardContent>
                                                            <Box sx={{ 
                                                                display: 'flex', 
                                                                alignItems: 'flex-start', 
                                                                justifyContent: 'space-between'
                                                            }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                                                    <Radio
                                                                        checked={selectedAddress?.id === address.id}
                                                                        onChange={() => handleAddressSelect(address)}
                                                                        sx={{ mt: -0.5, mr: 1 }}
                                                                    />
                                                                    <Box>
                                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                                            {address.name}
                                                                            {address.isDefault && (
                                                                                <Typography
                                                                                    component="span"
                                                                                    variant="caption"
                                                                                    sx={{
                                                                                        ml: 1,
                                                                                        px: 1,
                                                                                        py: 0.3,
                                                                                        bgcolor: 'primary.light',
                                                                                        color: 'primary.main',
                                                                                        borderRadius: 1,
                                                                                    }}
                                                                                >
                                                                                    Default
                                                                                </Typography>
                                                                            )}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.primary" fontWeight={500}>
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
                                                                </Box>
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    ) : (
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            py: 4, 
                                            px: 2,
                                            bgcolor: 'grey.50', 
                                            borderRadius: 2,
                                            border: '1px dashed',
                                            borderColor: 'divider',
                                            textAlign: 'center'
                                        }}>
                                            <LocationIcon color="action" sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
                                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                                No Saved Addresses
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                                                You don't have any saved addresses yet. Add a new address to continue with checkout.
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                onClick={() => setShowNewAddressDialog(true)}
                                                startIcon={<LocationIcon />}
                                            >
                                                Add a New Address
                                            </Button>
                                        </Box>
                                    )}

                                    {selectedAddress && !addresses.some(addr => addr.id === selectedAddress.id) && (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                                Selected New Address:
                                            </Typography>
                                            <Card
                                                sx={{
                                                    mb: 2,
                                                    border: '2px solid',
                                                    borderColor: 'primary.main',
                                                    borderRadius: 2,
                                                    bgcolor: 'primary.50'
                                                }}
                                            >
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                        <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                                                            New Address
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" fontWeight={500}>
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
                                        </Box>
                                    )}

                                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                        {addresses.length > 0 && (
                                            <Button
                                                variant="outlined"
                                                size="large"
                                                onClick={() => setShowNewAddressDialog(true)}
                                                startIcon={<LocationIcon />}
                                                sx={{ px: 3, py: 1, borderRadius: 2 }}
                                            >
                                                Add New Address
                                            </Button>
                                        )}
                                    </Box>
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
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                        Order Summary
                                    </Typography>
                                    {cartItems.map((item) => (
                                        <Paper 
                                            key={`${item.id}-${item.selectedSize}`} 
                                            elevation={0}
                                            variant="outlined"
                                            sx={{ 
                                                mb: 2,
                                                overflow: 'hidden',
                                                borderRadius: 2,
                                                display: 'flex',
                                                transition: 'transform 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ width: 100, height: 100, position: 'relative', flexShrink: 0 }}>
                                                <img
                                                    src={renderProductImage(item)}
                                                    alt={item.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = '/default-product-image.jpg';
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ 
                                                flex: 1, 
                                                p: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between'
                                            }}>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {item.name}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', mt: 1 }}>
                                                        <Typography 
                                                            variant="body2" 
                                                            color="text.secondary"
                                                            sx={{
                                                                px: 1,
                                                                py: 0.5,
                                                                mr: 1,
                                                                bgcolor: 'grey.100',
                                                                borderRadius: 1,
                                                                display: 'inline-block'
                                                            }}
                                                        >
                                                            Size: {item.selectedSize}
                                                        </Typography>
                                                        <Typography 
                                                            variant="body2" 
                                                            color="text.secondary"
                                                            sx={{
                                                                px: 1,
                                                                py: 0.5,
                                                                bgcolor: 'grey.100',
                                                                borderRadius: 1,
                                                                display: 'inline-block'
                                                            }}
                                                        >
                                                            Qty: {item.quantity}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600, mt: 1, alignSelf: 'flex-end' }}>
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Paper>
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
                        <Card sx={{ p: 0, overflow: 'hidden', borderRadius: 2 }}>
                            <Box sx={{ 
                                p: 2, 
                                bgcolor: 'primary.light', 
                                color: 'primary.dark', 
                                borderBottom: '1px solid', 
                                borderColor: 'divider'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Order Summary
                                </Typography>
                            </Box>
                            
                            <Box sx={{ p: 2 }}>
                                {cartItems.map((item) => (
                                    <Box 
                                        key={`${item.id}-${item.selectedSize}`} 
                                        sx={{ 
                                            mb: 2,
                                            pb: 2,
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            '&:last-child': {
                                                borderBottom: 'none',
                                                mb: 0,
                                                pb: 0
                                            },
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2
                                        }}
                                    >
                                        <Box 
                                            sx={{ 
                                                width: 60, 
                                                height: 60, 
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                flexShrink: 0
                                            }}
                                        >
                                            <img
                                                src={renderProductImage(item)}
                                                alt={item.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    e.target.src = '/default-product-image.jpg';
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {item.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                Size: {item.selectedSize} · Qty: {item.quantity}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </Typography>
                                        </Box>
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
                                    <Typography variant="h6" color="primary.main">${cartTotals.total.toFixed(2)}</Typography>
                                </Box>
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