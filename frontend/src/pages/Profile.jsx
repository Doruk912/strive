import React, {useEffect, useState} from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Avatar,
    TextField,
    Button,
    Grid,
    Alert,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Switch,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    ListItemIcon, IconButton,
    FormControlLabel,
} from '@mui/material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import 'react-phone-input-2/lib/material.css';
import {
    Save as SaveIcon,
    Add as AddIcon,
    LocationOn as LocationIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    Edit as EditIcon,
    Email as EmailIcon,
    LocalShipping as LocalShippingIcon,
    LocalOffer as LocalOfferIcon,
    Campaign as CampaignIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Helmet } from "react-helmet";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { addressService } from '../services/addressService';
import { notificationPreferencesService } from '../services/notificationPreferencesService';

const Profile = () => {
    const { user, login } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [openAddressDialog, setOpenAddressDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [addressFormData, setAddressFormData] = useState({
        name: '',
        recipientName: '',
        recipientPhone: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isDefault: false
    });
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    const formatPhoneNumber = (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        const digits = cleaned.slice(0, 10);
        let formatted = '';
        for (let i = 0; i < digits.length; i++) {
            if (i === 3 || i === 6 || i === 8) formatted += ' ';
            formatted += digits[i];
        }
        return formatted;
    };

    const [formData, setFormData] = useState(() => ({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phone ? formatPhoneNumber(user.phone) : '',
        countryCode: user?.countryCode || '+90'
    }));
    const [phoneError, setPhoneError] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [notificationPreferences, setNotificationPreferences] = useState({
        emailNotifications: true,
        orderUpdates: true,
        promotions: false,
        newsletter: true,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [addressError, setAddressError] = useState('');

    // Fetch addresses when component mounts
    useEffect(() => {
        if (user?.userId) {
            fetchAddresses();
        }
    }, [user?.userId]);

    const fetchAddresses = async () => {
        try {
            setIsLoading(true);
            const userAddresses = await addressService.getUserAddresses(user.userId, user.token);
            setAddresses(userAddresses);
            setAddressError('');
        } catch (error) {
            setAddressError(error.message || 'Failed to load addresses');
            console.error('Error fetching addresses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Add this useEffect to fetch notification preferences when component mounts
    useEffect(() => {
        if (user?.userId) {
            fetchNotificationPreferences();
        }
    }, [user?.userId]);

    const fetchNotificationPreferences = async () => {
        try {
            const preferences = await notificationPreferencesService.getUserPreferences(user.userId, user.token);
            setNotificationPreferences(preferences);
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
        }
    };

    const handleNotificationChange = async (preference) => {
        try {
            const updatedPreferences = {
                ...notificationPreferences,
                [preference]: !notificationPreferences[preference]
            };
            await notificationPreferencesService.updatePreferences(user.userId, updatedPreferences, user.token);
            setNotificationPreferences(updatedPreferences);
        } catch (error) {
            console.error('Error updating notification preferences:', error);
        }
    };

    const handleDeleteAddress = async (id) => {
        try {
            await addressService.deleteAddress(id, user.userId, user.token);
            await fetchAddresses();
        } catch (error) {
            setAddressError(error.message || 'Failed to delete address');
            console.error('Error deleting address:', error);
        }
    };

    const userFullName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.name || 'User';

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const validatePhoneNumber = (phone) => {
        if (!phone || phone.trim() === '') {
            setPhoneError('');
            return true;
        }

        const cleanPhone = phone.replace(/\D/g, '');

        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            setPhoneError('Please enter a valid phone number');
            return false;
        }

        setPhoneError('');
        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phoneNumber') {
            const numbersOnly = value.replace(/\D/g, '');
            const formattedValue = formatPhoneNumber(numbersOnly);
            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            }));
            validatePhoneNumber(formattedValue);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCountryCodeChange = (value, country) => {
        setFormData(prev => ({
            ...prev,
            countryCode: '+' + country.dialCode
        }));
    };

    const handleSubmit = async () => {
        try {
            const apiUrl = 'http://localhost:8080/api/users/' + user.userId;
            const phoneNumber = formData.phoneNumber.replace(/\s/g, '');
            const isPhoneNumberBlank = !phoneNumber;

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: isPhoneNumberBlank ? null : phoneNumber,
                    countryCode: isPhoneNumberBlank ? null : formData.countryCode
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update profile: ${response.status}`);
            }

            const responseData = await response.json();
            responseData.token = user.token;

            login({
                ...user,
                ...responseData,
                phone: responseData.phone ? formatPhoneNumber(responseData.phone) : '',
                countryCode: responseData.countryCode || '+90'
            });

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setErrorMessage(error.message);
        }
    };

    const handleEditAddress = (address) => {
        setSelectedAddress(address);
        setAddressFormData({
            name: address.name,
            recipientName: address.recipientName,
            recipientPhone: address.recipientPhone,
            streetAddress: address.streetAddress,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault
        });
        setOpenEditDialog(true);
    };

    const handleDeleteClick = (id) => {
        setAddressToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (addressToDelete) {
            await handleDeleteAddress(addressToDelete);
            setDeleteConfirmOpen(false);
            setAddressToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setAddressToDelete(null);
    };

    const handleCloseDialog = () => {
        setOpenAddressDialog(false);
        setOpenEditDialog(false);
        setSelectedAddress(null);
    };

    const AddressDialog = ({ open, onClose, address }) => {
        const [formData, setFormData] = useState({
            name: '',
            recipientName: '',
            recipientPhone: '',
            streetAddress: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            isDefault: false
        });

        const [errors, setErrors] = useState({});

        useEffect(() => {
            if (address) {
                setFormData({
                    name: address.name,
                    recipientName: address.recipientName,
                    recipientPhone: address.recipientPhone,
                    streetAddress: address.streetAddress,
                    city: address.city,
                    state: address.state,
                    postalCode: address.postalCode,
                    country: address.country,
                    isDefault: address.isDefault
                });
            } else {
                setFormData({
                    name: '',
                    recipientName: '',
                    recipientPhone: '',
                    streetAddress: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: '',
                    isDefault: false
                });
            }
            setErrors({});
        }, [address]);

        const validateForm = () => {
            const newErrors = {};
            if (!formData.name.trim()) newErrors.name = 'Address name is required';
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

        const handleSave = async () => {
            const validationErrors = validateForm();
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            try {
                const addressData = {
                    userId: user.userId,
                    name: formData.name,
                    recipientName: formData.recipientName,
                    recipientPhone: formData.recipientPhone,
                    streetAddress: formData.streetAddress,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    country: formData.country,
                    isDefault: formData.isDefault
                };

                if (address) {
                    await addressService.updateAddress(address.id, addressData, user.token);
                } else {
                    await addressService.createAddress(addressData, user.token);
                }

                onClose();
                fetchAddresses();
            } catch (error) {
                console.error('Error saving address:', error);
                setErrors({ submit: error.message || 'Failed to save address' });
            }
        };

        return (
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }
                }}
            >
                <DialogTitle sx={{
                    fontWeight: 600,
                    pb: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    px: 3,
                }}>
                    {address ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ pt: 2 }}>
                        {errors.submit && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errors.submit}
                            </Alert>
                        )}
                        <TextField
                            fullWidth
                            label="Address Name"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            error={!!errors.name}
                            helperText={errors.name}
                            placeholder="e.g., Home, Office, Summer House"
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Recipient Name"
                            name="recipientName"
                            value={formData.recipientName}
                            onChange={handleFormChange}
                            error={!!errors.recipientName}
                            helperText={errors.recipientName}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Recipient Phone"
                            name="recipientPhone"
                            value={formData.recipientPhone}
                            onChange={handleFormChange}
                            error={!!errors.recipientPhone}
                            helperText={errors.recipientPhone}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Street Address"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleFormChange}
                            error={!!errors.streetAddress}
                            helperText={errors.streetAddress}
                            multiline
                            rows={3}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleFormChange}
                                    error={!!errors.city}
                                    helperText={errors.city}
                                    sx={{
                                        mb: { xs: 2, sm: 0 },
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="State/Province"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleFormChange}
                                    sx={{
                                        mb: { xs: 2, sm: 0 },
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Postal Code"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleFormChange}
                                    sx={{
                                        mb: { xs: 2, sm: 0 },
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1
                                        }
                                    }}
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
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
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
                    </Box>
                </DialogContent>
                <DialogActions sx={{
                    p: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    mt: 3
                }}>
                    <Button
                        onClick={onClose}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            color: 'text.secondary'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 3,
                            borderRadius: 1,
                        }}
                    >
                        {address ? 'Save Changes' : 'Add Address'}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <>
            <Helmet>
                <title>Strive - Profile</title>
            </Helmet>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: '#f5f5f5',
                    pt: { xs: 4, sm: 6 },
                    pb: 4,
                    mt: { xs: -6, sm: -4 },
                }}
            >
                <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
                    <Grid container spacing={3}>
                        {/* Left Sidebar */}
                        <Grid item xs={12} md={3}>
                            <Paper
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    position: 'sticky',
                                    top: 24,
                                    bgcolor: 'white',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    mb: 3
                                }}>
                                    <Avatar
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            bgcolor: 'primary.main',
                                            fontSize: '2.5rem',
                                            mb: 2,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        {userFullName.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 600,
                                        mb: 1,
                                        textAlign: 'center'
                                    }}>
                                        {userFullName}
                                    </Typography>
                                    <Chip
                                        label={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                                        color="primary"
                                        size="small"
                                        sx={{ fontWeight: 500 }}
                                    />
                                </Box>

                                <List component="nav" sx={{ width: '100%' }}>
                                    {[
                                        { icon: <PersonIcon />, label: 'Profile Details', value: 0 },
                                        { icon: <LocationIcon />, label: 'Addresses', value: 1 },
                                        { icon: <NotificationsIcon />, label: 'Notifications', value: 3 },
                                    ].map((item) => (
                                        <ListItem
                                            button
                                            key={item.value}
                                            selected={activeTab === item.value}
                                            onClick={() => setActiveTab(item.value)}
                                            sx={{
                                                borderRadius: 1,
                                                mb: 1,
                                                '&.Mui-selected': {
                                                    bgcolor: 'primary.light',
                                                    color: 'primary.main',
                                                    '&:hover': {
                                                        bgcolor: 'primary.light',
                                                    }
                                                },
                                                '&:hover': {
                                                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                                                }
                                            }}
                                        >
                                            <ListItemIcon sx={{
                                                color: activeTab === item.value ? 'primary.main' : 'inherit',
                                                minWidth: 40
                                            }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontWeight: activeTab === item.value ? 600 : 400
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>

                        {/* Main Content */}
                        <Grid item xs={12} md={9}>
                            {showSuccess && (
                                <Alert
                                    severity="success"
                                    sx={{
                                        mb: 2,
                                        borderRadius: 2,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    Profile updated successfully!
                                </Alert>
                            )}
                            {errorMessage && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 2,
                                        borderRadius: 2,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    {errorMessage}
                                </Alert>
                            )}

                            <Paper
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                            >
                                {/* Content Header */}
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 4,
                                    pb: 2,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider'
                                }}>
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                        {activeTab === 0 && 'Profile Details'}
                                        {activeTab === 1 && 'Addresses'}
                                        {activeTab === 3 && 'Notifications'}
                                    </Typography>
                                </Box>

                                {/* Tab Content */}
                                <Box sx={{ px: { xs: 0, sm: 2 } }}>
                                    {activeTab === 0 && (
                                        <>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="First Name"
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleChange}
                                                        variant="outlined"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 1,
                                                                '&:hover fieldset': {
                                                                    borderColor: 'primary.main',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Last Name"
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={handleChange}
                                                        variant="outlined"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 1,
                                                                '&:hover fieldset': {
                                                                    borderColor: 'primary.main',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Email"
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        variant="outlined"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 1,
                                                                '&:hover fieldset': {
                                                                    borderColor: 'primary.main',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        gap: 2,
                                                        alignItems: 'flex-start'
                                                    }}>
                                                        <Box sx={{ width: '30%' }}>
                                                            <PhoneInput
                                                                country={formData.countryCode ? formData.countryCode.replace('+', '') : 'tr'}
                                                                value={formData.countryCode ? formData.countryCode.replace('+', '') : '90'}
                                                                onChange={handleCountryCodeChange}
                                                                inputProps={{
                                                                    style: {
                                                                        width: '100%',
                                                                        height: '56px',
                                                                        fontSize: '16px',
                                                                        borderRadius: '4px',
                                                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                                                        cursor: 'pointer'
                                                                    },
                                                                    readOnly: true,
                                                                    onClick: () => {
                                                                        const dropdownButton = document.querySelector('.react-tel-input .selected-flag');
                                                                        if (dropdownButton) {
                                                                            dropdownButton.click();
                                                                        }
                                                                    }
                                                                }}
                                                                buttonStyle={{
                                                                    border: '1px solid rgba(0, 0, 0, 0.23)',
                                                                    borderRight: 'none',
                                                                    backgroundColor: 'transparent',
                                                                    borderRadius: '4px 0 0 4px',
                                                                }}
                                                                containerStyle={{
                                                                    width: '100%',
                                                                }}
                                                                dropdownStyle={{
                                                                    width: '300px',
                                                                    maxHeight: '300px',
                                                                }}
                                                                searchStyle={{
                                                                    width: '100%',
                                                                    height: '40px',
                                                                    margin: '5px 0',
                                                                }}
                                                                enableSearch={true}
                                                                searchPlaceholder="Search country..."
                                                                searchNotFound="No country found"
                                                                preferredCountries={['tr', 'us', 'gb', 'de']}
                                                            />
                                                        </Box>
                                                        <Box sx={{ width: '70%' }}>
                                                            <TextField
                                                                fullWidth
                                                                label="Phone Number"
                                                                name="phoneNumber"
                                                                value={formData.phoneNumber}
                                                                onChange={handleChange}
                                                                variant="outlined"
                                                                placeholder="555 111 22 33"
                                                                inputProps={{
                                                                    maxLength: 13, // (10 digits + 3 spaces)
                                                                    inputMode: 'numeric',
                                                                    pattern: '[0-9]*'
                                                                }}
                                                                error={!!phoneError}
                                                                helperText={phoneError}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        borderRadius: 1,
                                                                        height: '56px',
                                                                        '&:hover fieldset': {
                                                                            borderColor: 'primary.main',
                                                                        },
                                                                        '& input': {
                                                                            height: '21px',
                                                                            padding: '16.5px 14px',
                                                                        }
                                                                    },
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                    {phoneError && (
                                                        <Typography
                                                            color="error"
                                                            variant="caption"
                                                            sx={{
                                                                mt: 1,
                                                                ml: 2,
                                                                display: 'block'
                                                            }}
                                                        >
                                                            {phoneError}
                                                        </Typography>
                                                    )}
                                                </Grid>
                                            </Grid>
                                            <Box sx={{
                                                mt: 4,
                                                pt: 3,
                                                borderTop: '1px solid',
                                                borderColor: 'divider',
                                                display: 'flex',
                                                justifyContent: 'flex-end'
                                            }}>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<SaveIcon />}
                                                    onClick={handleSubmit}
                                                    disabled={!!phoneError}
                                                    sx={{
                                                        px: 3,
                                                        py: 1,
                                                        borderRadius: 1,
                                                        textTransform: 'none',
                                                        fontWeight: 500,
                                                        bgcolor: 'primary.main',
                                                        '&:hover': {
                                                            bgcolor: 'primary.dark',
                                                        }
                                                    }}
                                                >
                                                    Save Changes
                                                </Button>
                                            </Box>
                                        </>
                                    )}

                                    {activeTab === 1 && (
                                        <Grid container spacing={3}>
                                            {isLoading ? (
                                                <Grid item xs={12}>
                                                    <Typography>Loading addresses...</Typography>
                                                </Grid>
                                            ) : addressError ? (
                                                <Grid item xs={12}>
                                                    <Alert severity="error">{addressError}</Alert>
                                                </Grid>
                                            ) : (
                                                <>
                                                    {addresses.map((address) => (
                                                        <Grid item xs={12} sm={6} key={address.id}>
                                                            <Card
                                                                sx={{
                                                                    height: '100%',
                                                                    borderRadius: 2,
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                                    transition: 'all 0.3s ease',
                                                                    position: 'relative',
                                                                    '&:hover': {
                                                                        transform: 'translateY(-2px)',
                                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                                    },
                                                                }}
                                                            >
                                                                <CardContent sx={{ p: 3 }}>
                                                                    <Box sx={{ mb: 2 }}>
                                                                        <Typography
                                                                            variant="h6"
                                                                            sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 1,
                                                                                fontWeight: 600,
                                                                                color: 'text.primary',
                                                                            }}
                                                                        >
                                                                            <LocationIcon
                                                                                sx={{
                                                                                    color: 'primary.main',
                                                                                    fontSize: 24,
                                                                                }}
                                                                            />
                                                                            {address.name}
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box
                                                                        sx={{
                                                                            p: 2,
                                                                            bgcolor: 'grey.50',
                                                                            borderRadius: 1,
                                                                            mb: 2,
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            variant="body1"
                                                                            sx={{
                                                                                color: 'text.secondary',
                                                                                lineHeight: 1.6,
                                                                            }}
                                                                        >
                                                                            {address.streetAddress}
                                                                            <br />
                                                                            {address.city}, {address.state} {address.postalCode}
                                                                            <br />
                                                                            {address.country}
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box
                                                                        sx={{
                                                                            display: 'flex',
                                                                            gap: 1,
                                                                            mt: 3,
                                                                        }}
                                                                    >
                                                                        <Button
                                                                            variant="outlined"
                                                                            size="small"
                                                                            startIcon={<EditIcon />}
                                                                            onClick={() => handleEditAddress(address)}
                                                                            sx={{
                                                                                borderRadius: 1,
                                                                                textTransform: 'none',
                                                                                fontWeight: 500,
                                                                                flex: 1,
                                                                                borderColor: 'primary.main',
                                                                                color: 'primary.main',
                                                                                '&:hover': {
                                                                                    borderColor: 'primary.dark',
                                                                                    bgcolor: 'primary.50',
                                                                                },
                                                                            }}
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                        <IconButton
                                                                            onClick={() => handleDeleteClick(address.id)}
                                                                            sx={{
                                                                                color: 'error.main',
                                                                                '&:hover': {
                                                                                    bgcolor: 'error.50',
                                                                                },
                                                                            }}
                                                                        >
                                                                            <DeleteOutlineIcon />
                                                                        </IconButton>
                                                                    </Box>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))}

                                                    {/* Add New Address Card */}
                                                    <Grid item xs={12} sm={6}>
                                                        <Card
                                                            onClick={() => {
                                                                setSelectedAddress(null);
                                                                setOpenAddressDialog(true);
                                                            }}
                                                            sx={{
                                                                height: '100%',
                                                                borderRadius: 2,
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                                transition: 'all 0.3s ease',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                bgcolor: 'grey.50',
                                                                border: '2px dashed',
                                                                borderColor: 'grey.300',
                                                                '&:hover': {
                                                                    borderColor: 'primary.main',
                                                                    bgcolor: 'primary.50',
                                                                    transform: 'translateY(-2px)',
                                                                },
                                                            }}
                                                        >
                                                            <CardContent
                                                                sx={{
                                                                    textAlign: 'center',
                                                                    py: 5,
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: 2,
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        width: 64,
                                                                        height: 64,
                                                                        borderRadius: '50%',
                                                                        bgcolor: 'primary.main',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        mb: 1,
                                                                    }}
                                                                >
                                                                    <AddIcon sx={{ fontSize: 32, color: 'white' }} />
                                                                </Box>
                                                                <Box>
                                                                    <Typography
                                                                        variant="h6"
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            color: 'primary.main',
                                                                            mb: 1,
                                                                        }}
                                                                    >
                                                                        Add New Address
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            color: 'text.secondary',
                                                                        }}
                                                                    >
                                                                        Click to add a new delivery address
                                                                    </Typography>
                                                                </Box>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                </>
                                            )}
                                        </Grid>
                                    )}

                                    {activeTab === 3 && (
                                        <Box
                                            sx={{
                                                maxWidth: 600,
                                                '@keyframes slideIn': {
                                                    from: { opacity: 0, transform: 'translateY(10px)' },
                                                    to: { opacity: 1, transform: 'translateY(0)' }
                                                },
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    mb: 3,
                                                    fontWeight: 600,
                                                    color: 'primary.main',
                                                    animation: 'slideIn 0.3s ease-out'
                                                }}
                                            >
                                                Notification Preferences
                                            </Typography>

                                            <List sx={{
                                                bgcolor: 'background.paper',
                                                borderRadius: 2,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                p: 2,
                                                animation: 'slideIn 0.3s ease-out',
                                                '&:hover': {
                                                    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                                                    transition: 'box-shadow 0.3s ease-in-out'
                                                }
                                            }}>
                                                {[
                                                    {
                                                        id: 'emailNotifications',
                                                        title: 'Email Notifications',
                                                        description: 'Receive notifications via email',
                                                        Icon: EmailIcon
                                                    },
                                                    {
                                                        id: 'orderUpdates',
                                                        title: 'Order Updates',
                                                        description: 'Get notified about your order status',
                                                        Icon: LocalShippingIcon
                                                    },
                                                    {
                                                        id: 'promotions',
                                                        title: 'Promotions',
                                                        description: 'Receive promotional offers and deals',
                                                        Icon: LocalOfferIcon
                                                    },
                                                    {
                                                        id: 'newsletter',
                                                        title: 'Newsletter',
                                                        description: 'Subscribe to our newsletter',
                                                        Icon: CampaignIcon
                                                    }
                                                ].map((item, index) => {
                                                    const Icon = item.Icon;
                                                    return (
                                                        <ListItem
                                                            key={item.id}
                                                            sx={{
                                                                borderBottom: index !== 3 ? '1px solid' : 'none',
                                                                borderColor: 'divider',
                                                                py: 2,
                                                                transition: 'all 0.2s ease-in-out',
                                                                '&:hover': {
                                                                    bgcolor: 'action.hover',
                                                                    transform: 'translateX(4px)'
                                                                }
                                                            }}
                                                        >
                                                            <ListItemIcon sx={{ minWidth: 45 }}>
                                                                <Icon color="primary" />
                                                            </ListItemIcon>

                                                            <ListItemText
                                                                primary={item.title}
                                                                secondary={item.description}
                                                                primaryTypographyProps={{
                                                                    fontWeight: 600,
                                                                    fontSize: '1.1rem',
                                                                    mb: 0.5,
                                                                    color: 'text.primary'
                                                                }}
                                                                secondaryTypographyProps={{
                                                                    color: 'text.secondary',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            />

                                                            <ListItemSecondaryAction>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <Switch
                                                                        edge="end"
                                                                        checked={notificationPreferences[item.id]}
                                                                        onChange={() => handleNotificationChange(item.id)}
                                                                        color="primary"
                                                                        sx={{
                                                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                                                color: 'primary.main',
                                                                            },
                                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                                backgroundColor: 'primary.main',
                                                                            },
                                                                            '& .MuiSwitch-thumb': {
                                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                            },
                                                                            '& .MuiSwitch-track': {
                                                                                opacity: 0.8,
                                                                                backgroundColor: 'grey.300',
                                                                            }
                                                                        }}
                                                                    />
                                                                    {notificationPreferences[item.id] && (
                                                                        <Box
                                                                            sx={{
                                                                                width: 8,
                                                                                height: 8,
                                                                                borderRadius: '50%',
                                                                                bgcolor: 'success.main',
                                                                                ml: 1,
                                                                                animation: 'slideIn 0.2s ease-out'
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                            </ListItemSecondaryAction>
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            {/* Add Address Dialog */}
            <AddressDialog
                open={openAddressDialog || openEditDialog}
                onClose={handleCloseDialog}
                address={selectedAddress}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this address? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Profile;