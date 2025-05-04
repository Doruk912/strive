import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Grid,
    Box,
    Typography,
    Divider,
    Paper,
    InputAdornment,
    useTheme
} from '@mui/material';
import { 
    Home as HomeIcon, 
    Person as PersonIcon, 
    Phone as PhoneIcon, 
    LocationOn as LocationIcon, 
    LocationCity as CityIcon, 
    Public as CountryIcon,
    SaveAlt as SaveIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { addressService } from '../services/addressService';

const CheckoutAddressDialog = ({ open, onClose, onAddressSelect, user }) => {
    const theme = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        recipientName: '',
        recipientPhone: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isDefault: false,
    });

    const [errors, setErrors] = useState({});
    const [showSavePrompt, setShowSavePrompt] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.recipientName.trim()) newErrors.recipientName = 'Recipient name is required';
        if (!formData.recipientPhone.trim()) newErrors.recipientPhone = 'Recipient phone is required';
        if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        return newErrors;
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setShowSavePrompt(true);
    };

    const handleSaveAddress = async () => {
        // Check if the address has a title/name
        if (!formData.name.trim()) {
            setErrors(prev => ({
                ...prev,
                name: 'Please provide a name for this address'
            }));
            return;
        }
        
        try {
            await addressService.createAddress({
                ...formData,
                userId: user.userId
            }, user.token);
            onAddressSelect(formData);
            onClose();
        } catch (error) {
            console.error('Error saving address:', error);
        }
    };

    const handleUseAddress = () => {
        onAddressSelect(formData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ 
                bgcolor: theme.palette.primary.main, 
                color: 'white',
                display: 'flex',
                alignItems: 'center'
            }}>
                <LocationIcon sx={{ mr: 1 }} />
                {showSavePrompt ? 'Save Address to Your Profile' : 'Add New Shipping Address'}
            </DialogTitle>
            <DialogContent sx={{ px: 3, py: 4 }}>
                {showSavePrompt ? (
                    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom color="primary.main" sx={{ fontWeight: 600 }}>
                            Would you like to save this address for future orders?
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Saving this address will make checkout faster next time and you can easily manage all your saved addresses in your profile.
                        </Typography>
                        
                        <Box sx={{ 
                            p: 2, 
                            my: 3, 
                            bgcolor: 'background.default', 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                Address Preview:
                            </Typography>
                            <Typography variant="body2">{formData.recipientName}</Typography>
                            <Typography variant="body2">{formData.streetAddress}</Typography>
                            <Typography variant="body2">
                                {formData.city}{formData.state ? `, ${formData.state}` : ''} {formData.postalCode}
                            </Typography>
                            <Typography variant="body2">{formData.country}</Typography>
                        </Box>
                        
                        <TextField
                            fullWidth
                            label="Address Title"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            error={!!errors.name}
                            helperText={errors.name || "Give this address a name (e.g., Home, Work, Mom's House)"}
                            variant="outlined"
                            margin="normal"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <HomeIcon color="primary" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                            required
                        />
                        
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isDefault}
                                    onChange={handleFormChange}
                                    name="isDefault"
                                    color="primary"
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <StarIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1rem' }} />
                                    <Typography variant="body2">Set as default address</Typography>
                                </Box>
                            }
                        />
                        
                        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={handleSaveAddress}
                                startIcon={<SaveIcon />}
                                size="large"
                            >
                                Save to My Addresses
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleUseAddress}
                                size="large"
                            >
                                Just Use Once
                            </Button>
                        </Box>
                    </Paper>
                ) : (
                    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                        <Box component="form" onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        color: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                     }}>
                                        <PersonIcon sx={{ mr: 1 }} />
                                        Recipient Information
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Recipient Full Name"
                                        name="recipientName"
                                        value={formData.recipientName}
                                        onChange={handleFormChange}
                                        error={!!errors.recipientName}
                                        helperText={errors.recipientName}
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Recipient Phone Number"
                                        name="recipientPhone"
                                        value={formData.recipientPhone}
                                        onChange={handleFormChange}
                                        error={!!errors.recipientPhone}
                                        helperText={errors.recipientPhone}
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PhoneIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        required
                                    />
                                </Grid>
                                
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        color: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                     }}>
                                        <LocationIcon sx={{ mr: 1 }} />
                                        Address Details
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Street Address"
                                        name="streetAddress"
                                        value={formData.streetAddress}
                                        onChange={handleFormChange}
                                        error={!!errors.streetAddress}
                                        helperText={errors.streetAddress}
                                        multiline
                                        rows={2}
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocationIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleFormChange}
                                        error={!!errors.city}
                                        helperText={errors.city}
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CityIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="State/Province"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleFormChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Postal Code"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleFormChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleFormChange}
                                        error={!!errors.country}
                                        helperText={errors.country}
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CountryIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        required
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                )}
            </DialogContent>
            {!showSavePrompt && (
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button 
                        onClick={onClose}
                        variant="outlined"
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ borderRadius: 2, px: 4 }}
                    >
                        Continue
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default CheckoutAddressDialog; 