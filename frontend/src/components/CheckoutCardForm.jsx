import React, { useState, useRef } from 'react';
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

const CheckoutCardForm = ({ onCardDetailsChange, errors = {} }) => {
    const [showCvv, setShowCvv] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const expiryInputRef = useRef(null);
    const [cardErrors, setCardErrors] = useState({});

    const validateCardNumber = (number) => {
        // Remove spaces and check if it's a valid number
        const cleanNumber = number.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cleanNumber)) return false;
        
        // Luhn algorithm check
        let sum = 0;
        let isEven = false;
        
        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber.charAt(i));
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
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
        return /^\d{3,4}$/.test(cvv);
    };

    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
        // Format with spaces after every 4 digits
        const formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(formattedValue);
        onCardDetailsChange('cardNumber', value);
        
        // Validate and show error
        if (value.length > 0 && !validateCardNumber(value)) {
            setCardErrors(prev => ({ ...prev, cardNumber: 'Please enter a valid card number' }));
        } else {
            setCardErrors(prev => ({ ...prev, cardNumber: '' }));
        }
    };

    const handleExpiryDateChange = (e) => {
        e.preventDefault();
        
        const input = e.target;
        const { value, selectionStart } = input;
        const previousValue = expiryDate;
        
        // Special case: handle backspace at the slash position
        if (
            e.nativeEvent.inputType === 'deleteContentBackward' && 
            selectionStart === 3 && 
            previousValue.charAt(selectionStart - 1) === '/'
        ) {
            const newValue = previousValue.substring(0, 2) + previousValue.substring(3);
            const newCursorPos = 2;
            
            setExpiryDate(newValue.substring(0, newCursorPos));
            onCardDetailsChange('expiryDate', newValue.substring(0, newCursorPos));
            
            // Set cursor position after state update
            setTimeout(() => {
                if (expiryInputRef.current) {
                    expiryInputRef.current.selectionStart = newCursorPos;
                    expiryInputRef.current.selectionEnd = newCursorPos;
                }
            }, 0);
            
            return;
        }
        
        // Remove all non-digit characters
        let cleanValue = value.replace(/\D/g, '');
        
        // Limit to 4 digits (MMYY)
        cleanValue = cleanValue.slice(0, 4);
        
        // Format with slash
        let formattedValue = cleanValue;
        if (cleanValue.length > 2) {
            formattedValue = cleanValue.slice(0, 2) + '/' + cleanValue.slice(2);
        }
        
        // Update state
        setExpiryDate(formattedValue);
        onCardDetailsChange('expiryDate', formattedValue);
        
        // Validate and show error
        if (formattedValue.length > 0 && !validateExpiryDate(formattedValue)) {
            setCardErrors(prev => ({ ...prev, expiryDate: 'Please enter a valid expiry date' }));
        } else {
            setCardErrors(prev => ({ ...prev, expiryDate: '' }));
        }
        
        // Restore cursor position for better UX
        if (e.nativeEvent.inputType !== 'deleteContentBackward' && 
            cleanValue.length === 2 && 
            previousValue.length === 2) {
            // Just added second digit, move cursor past the slash
            setTimeout(() => {
                if (expiryInputRef.current) {
                    expiryInputRef.current.selectionStart = 4;
                    expiryInputRef.current.selectionEnd = 4;
                }
            }, 0);
        }
    };

    const handleCvvChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        setCvv(value);
        onCardDetailsChange('cvv', value);
        
        // Validate and show error
        if (value.length > 0 && !validateCvv(value)) {
            setCardErrors(prev => ({ ...prev, cvv: 'Please enter a valid CVV' }));
        } else {
            setCardErrors(prev => ({ ...prev, cvv: '' }));
        }
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        setCardholderName(value);
        onCardDetailsChange('cardholderName', value);
        
        // Validate and show error
        if (value.length > 0 && value.trim().length < 2) {
            setCardErrors(prev => ({ ...prev, cardholderName: 'Please enter a valid name' }));
        } else {
            setCardErrors(prev => ({ ...prev, cardholderName: '' }));
        }
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
                        helperText={errors.cardNumber || 'Enter your 16-digit card number'}
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
                        value={cardholderName}
                        onChange={handleNameChange}
                        error={!!errors.cardholderName}
                        helperText={errors.cardholderName || 'Enter the name on your card'}
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
                        helperText={errors.expiryDate || 'Enter expiry date (MM/YY)'}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CalendarIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        inputProps={{
                            maxLength: 5,
                            placeholder: 'MM/YY',
                            ref: expiryInputRef
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
                        helperText={errors.cvv || 'Enter the 3 or 4-digit security code'}
                        type={showCvv ? 'text' : 'password'}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowCvv(!showCvv)}
                                        edge="end"
                                    >
                                        {showCvv ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        inputProps={{
                            maxLength: 4,
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