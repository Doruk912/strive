import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    TextField,
    Button,
    Stepper,
    Step,
    StepLabel,
    Divider,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import {Helmet} from "react-helmet";

const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

const Checkout = () => {
    const [activeStep, setActiveStep] = useState(0);
    const { cartItems, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [shippingData, setShippingData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('credit');

    const handleShippingChange = (e) => {
        setShippingData({
            ...shippingData,
            [e.target.name]: e.target.value,
        });
    };

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            // Handle order submission
            handlePlaceOrder();
        } else {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handlePlaceOrder = () => {
        // Here you would typically make an API call to process the order
        clearCart();
        navigate('/order-confirmation');
    };

    const renderShippingForm = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
                <TextField
                    required
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={shippingData.firstName}
                    onChange={handleShippingChange}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    required
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={shippingData.lastName}
                    onChange={handleShippingChange}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    required
                    fullWidth
                    label="Address"
                    name="address"
                    value={shippingData.address}
                    onChange={handleShippingChange}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    required
                    fullWidth
                    label="City"
                    name="city"
                    value={shippingData.city}
                    onChange={handleShippingChange}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    required
                    fullWidth
                    label="State"
                    name="state"
                    value={shippingData.state}
                    onChange={handleShippingChange}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    required
                    fullWidth
                    label="ZIP Code"
                    name="zipCode"
                    value={shippingData.zipCode}
                    onChange={handleShippingChange}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    required
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={shippingData.phone}
                    onChange={handleShippingChange}
                />
            </Grid>
        </Grid>
    );

    const renderPaymentForm = () => (
        <FormControl component="fieldset">
            <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
            >
                <FormControlLabel
                    value="credit"
                    control={<Radio />}
                    label="Credit Card"
                />
                <FormControlLabel
                    value="debit"
                    control={<Radio />}
                    label="Debit Card"
                />
                <FormControlLabel
                    value="paypal"
                    control={<Radio />}
                    label="PayPal"
                />
            </RadioGroup>
        </FormControl>
    );

    const renderReviewOrder = () => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Order Summary
            </Typography>
            {cartItems.map((item) => (
                <Box key={item.id} sx={{ mb: 2 }}>
                    <Grid container>
                        <Grid item xs={8}>
                            <Typography>{item.name}</Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                            <Typography>
                                ${(item.price * item.quantity).toFixed(2)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Grid container>
                <Grid item xs={8}>
                    <Typography variant="h6">Total</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="h6">
                        ${getCartTotal().toFixed(2)}
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return renderShippingForm();
            case 1:
                return renderPaymentForm();
            case 2:
                return renderReviewOrder();
            default:
                return 'Unknown step';
        }
    };

    return (
        <>
            <Helmet>
                <title>Strive - Checkout</title>
            </Helmet>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom align="center">
                    Checkout
                </Typography>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Box sx={{ mt: 4 }}>
                    {getStepContent(activeStep)}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                        {activeStep !== 0 && (
                            <Button onClick={handleBack} sx={{ mr: 1 }}>
                                Back
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            onClick={handleNext}
                        >
                            {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
            </>
    );
};

export default Checkout;