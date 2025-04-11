import React, { useState } from 'react';
import {
    Box,
    TextField,
    Grid,
    FormControlLabel,
    Switch,
    Button,
    Typography,
    Paper,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const CheckoutAddressForm = ({ onAddressSubmit, onSaveAddress, initialAddress = null }) => {
    const [formData, setFormData] = useState({
        name: initialAddress?.name || '',
        recipientName: initialAddress?.recipientName || '',
        recipientPhone: initialAddress?.recipientPhone || '',
        streetAddress: initialAddress?.streetAddress || '',
        city: initialAddress?.city || '',
        state: initialAddress?.state || '',
        postalCode: initialAddress?.postalCode || '',
        country: initialAddress?.country || '',
        isDefault: initialAddress?.isDefault || false,
    });

    const [errors, setErrors] = useState({});

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

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        onAddressSubmit(formData);
    };

    const handleSaveAddress = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        onSaveAddress(formData);
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Shipping Address
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
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
                            label="Save this address for future use"
                        />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                    >
                        Use This Address
                    </Button>
                    {formData.isDefault && (
                        <Button
                            variant="outlined"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveAddress}
                            fullWidth
                        >
                            Save Address
                        </Button>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default CheckoutAddressForm; 