import React, { useState } from 'react';
import {
    Box,
    TextField,
    Grid,
    Typography,
    InputAdornment,
    IconButton,
    Alert,
} from '@mui/material';
import {
    CreditCard as CreditCardIcon,
    CalendarToday as CalendarIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

const CheckoutCardForm = ({ onCardDetailsChange, errors }) => {
    const [showCvv, setShowCvv] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
        // Format with spaces after every 4 digits
        const formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(formattedValue);
        onCardDetailsChange('cardNumber', value);
    };

    const handleExpiryDateChange = (e) => {
        // Remove any non-digit and limit to 4 digits (MMYY)
        const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
        let formatted = '';
        if (digits.length === 0) {
            formatted = '';
        } else if (digits.length <= 2) {
        // Only month digits entered – show as is
            formatted = digits;
        } else {
        // Insert slash after the month digits
            formatted = digits.slice(0, 2) + '/' + digits.slice(2);
        }
        setExpiryDate(formatted);
        onCardDetailsChange('expiryDate', formatted);
    };

    const handleCvvChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 3);
        setCvv(value);
        onCardDetailsChange('cvv', value);
    };

    const handleNameChange = (e) => {
        onCardDetailsChange('cardholderName', e.target.value);
    };

    const validateCardNumber = (number) => {
        // Remove spaces and check if it's a valid length
        const cleanNumber = number.replace(/\s/g, '');
        return cleanNumber.length >= 13 && cleanNumber.length <= 19;
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

    const validateCvv = (cvv) => {
        return cvv.length >= 3 && cvv.length <= 4;
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Card Details
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Card Number"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        error={!!errors.cardNumber}
                        helperText={errors.cardNumber ? 'Please enter a valid 16-digit card number' : ''}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CreditCardIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        inputProps={{
                            maxLength: 19,
                            inputMode: 'numeric',
                            pattern: '[0-9]*'
                        }}
                        placeholder="1234 5678 9012 3456"
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Cardholder Name"
                        placeholder="John Doe"
                        onChange={handleNameChange}
                        error={errors.cardholderName}
                        helperText={errors.cardholderName ? 'Please enter the cardholder name' : ''}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                },
                            },
                        }}
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Expiry Date"
                        value={expiryDate}
                        onChange={handleExpiryDateChange}
                        error={!!errors.expiryDate}
                        helperText={errors.expiryDate ? 'Please enter a valid expiry date (MM/YY)' : ''}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CalendarIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        inputProps={{
                            maxLength: 5,
                            placeholder: 'MM/YY'
                        }}
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="CVV"
                        value={cvv}
                        onChange={handleCvvChange}
                        error={!!errors.cvv}
                        helperText={errors.cvv ? 'Please enter a valid 3-digit CVV' : ''}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        inputProps={{
                            maxLength: 3,
                            inputMode: 'numeric',
                            pattern: '[0-9]*'
                        }}
                        placeholder="123"
                    />
                </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                Your payment information is secure and encrypted. We do not store your card details.
            </Alert>
        </Box>
    );
};

export default CheckoutCardForm; 