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
} from '@mui/material';
import { addressService } from '../services/addressService';

const CheckoutAddressDialog = ({ open, onClose, onAddressSelect, user }) => {
    const [formData, setFormData] = useState({
        name: 'New Address',
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
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogContent>
                {showSavePrompt ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            Would you like to save this address for future use?
                        </Typography>
                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={handleSaveAddress}
                            >
                                Yes, Save Address
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleUseAddress}
                            >
                                No, Just Use It
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Recipient Name"
                                    name="recipientName"
                                    value={formData.recipientName}
                                    onChange={handleFormChange}
                                    error={!!errors.recipientName}
                                    helperText={errors.recipientName}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Recipient Phone"
                                    name="recipientPhone"
                                    value={formData.recipientPhone}
                                    onChange={handleFormChange}
                                    error={!!errors.recipientPhone}
                                    helperText={errors.recipientPhone}
                                    required
                                />
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
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleFormChange}
                                    error={!!errors.city}
                                    helperText={errors.city}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="State/Province"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Postal Code"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleFormChange}
                                    error={!!errors.country}
                                    helperText={errors.country}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isDefault}
                                            onChange={handleFormChange}
                                            name="isDefault"
                                        />
                                    }
                                    label="Set as default address"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </DialogContent>
            {!showSavePrompt && (
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Continue
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default CheckoutAddressDialog; 