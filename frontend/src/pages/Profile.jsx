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
    ListItemIcon, IconButton, FormControlLabel,
} from '@mui/material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import 'react-phone-input-2/lib/material.css';
import {
    Save as SaveIcon,
    Add as AddIcon,
    CreditCard as CreditCardIcon,
    LocationOn as LocationIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    Edit as EditIcon,
    StarOutline as StarOutlineIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Helmet } from "react-helmet";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const Profile = () => {
    const { user, login } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [openAddressDialog, setOpenAddressDialog] = useState(false);
    const [openCardDialog, setOpenCardDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [addressFormData, setAddressFormData] = useState({
        name: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isDefault: false
    });
    const [formData, setFormData] = useState(() => ({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phone ? formatPhoneNumber(user.phone) : '',
        countryCode: user?.countryCode || '+90'
    }));
    const [phoneError, setPhoneError] = useState('');
    const [addresses, setAddresses] = useState([
        { id: 1, type: 'Home', address: '123 Main St, City, Country', isDefault: true },
        { id: 2, type: 'Work', address: '456 Office Ave, City, Country', isDefault: false },
    ]);
    const [cards, setCards] = useState([
        { id: 1, type: 'Visa', last4: '4242', expiry: '12/25' },
        { id: 2, type: 'Mastercard', last4: '8888', expiry: '06/24' },
    ]);
    const [notificationPreferences, setNotificationPreferences] = useState({
        emailNotifications: true,
        orderUpdates: true,
        promotions: false,
        newsletter: true,
    });
    const [selectedCard, setSelectedCard] = useState(null);
    const [cardFormData, setCardFormData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });
    const [openEditCardDialog, setOpenEditCardDialog] = useState(false);

// Add these handlers after the existing handler functions
    const handleEditCard = (card) => {
        setSelectedCard(card);
        setCardFormData({
            cardNumber: `•••• •••• •••• ${card.last4}`,
            expiryDate: card.expiry,
            cvv: ''
        });
        setOpenEditCardDialog(true);
    };

    const handleCloseCardDialog = () => {
        setOpenCardDialog(false);
        setOpenEditCardDialog(false);
        setSelectedCard(null);
        setCardFormData({
            cardNumber: '',
            expiryDate: '',
            cvv: ''
        });
    };

    const handleSaveCard = () => {
        if (selectedCard) {
            setCards(prev => prev.map(card =>
                card.id === selectedCard.id
                    ? {
                        ...card,
                        expiry: cardFormData.expiryDate
                    }
                    : card
            ));
        }
        handleCloseCardDialog();
    };

    const handleCardFormChange = (e) => {
        const { name, value } = e.target;
        setCardFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

    const handleNotificationChange = (preference) => {
        setNotificationPreferences(prev => ({
            ...prev,
            [preference]: !prev[preference]
        }));
    };

    const handleDeleteAddress = (id) => {
        setAddresses(prev => prev.filter(addr => addr.id !== id));
    };

    const handleDeleteCard = (id) => {
        setCards(prev => prev.filter(card => card.id !== id));
    };

    const handleEditAddress = (address) => {
        setSelectedAddress(address);
        setAddressFormData({
            name: address.type,
            streetAddress: address.address.split(',')[0].trim(),
            city: address.address.split(',')[1]?.trim() || '',
            state: address.address.split(',')[2]?.trim() || '',
            postalCode: address.address.split(',')[3]?.trim() || '',
            country: address.address.split(',')[4]?.trim() || '',
            isDefault: address.isDefault
        });
        setOpenEditDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenAddressDialog(false);
        setOpenEditDialog(false);
        setSelectedAddress(null);
    };

    const AddressDialog = ({ open, onClose, address }) => {
        const [formData, setFormData] = useState({
            name: '',
            streetAddress: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            isDefault: false
        });

        useEffect(() => {
            if (address) {
                setFormData({
                    name: address.type,
                    streetAddress: address.address.split(',')[0].trim(),
                    city: address.address.split(',')[1]?.trim() || '',
                    state: address.address.split(',')[2]?.trim() || '',
                    postalCode: address.address.split(',')[3]?.trim() || '',
                    country: address.address.split(',')[4]?.trim() || '',
                    isDefault: address.isDefault
                });
            } else {
                setFormData({
                    name: '',
                    streetAddress: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: '',
                    isDefault: false
                });
            }
        }, [address]);

        const handleFormChange = (e) => {
            const { name, value, checked } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: name === 'isDefault' ? checked : value
            }));
        };

        const handleSave = () => {
            const formattedAddress = `${formData.streetAddress}, ${formData.city}, ${formData.state}, ${formData.postalCode}, ${formData.country}`;

            if (address) {
                // Edit existing address
                setAddresses(prev => prev.map(addr =>
                    addr.id === address.id
                        ? {
                            ...addr,
                            type: formData.name,
                            address: formattedAddress,
                            isDefault: formData.isDefault
                        }
                        : formData.isDefault
                            ? { ...addr, isDefault: false }
                            : addr
                ));
            } else {
                // Add new address
                const newAddress = {
                    id: Date.now(),
                    type: formData.name,
                    address: formattedAddress,
                    isDefault: formData.isDefault
                };

                setAddresses(prev => formData.isDefault
                    ? [...prev.map(addr => ({ ...addr, isDefault: false })), newAddress]
                    : [...prev, newAddress]
                );
            }

            onClose();
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
                        <TextField
                            fullWidth
                            label="Address Name"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
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
                            label="Street Address"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleFormChange}
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
                                    color="primary"
                                />
                            }
                            label="Set as default address"
                            sx={{ mt: 2 }}
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
                                        { icon: <CreditCardIcon />, label: 'Payment Methods', value: 2 },
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
                                        {activeTab === 2 && 'Payment Methods'}
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
                                                        {address.isDefault && (
                                                            <Box
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 16,
                                                                    right: 16,
                                                                    zIndex: 1,
                                                                }}
                                                            >
                                                                <Chip
                                                                    label="Default Address"
                                                                    color="primary"
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 500,
                                                                        bgcolor: 'primary.main',
                                                                        '& .MuiChip-label': {
                                                                            px: 1,
                                                                        },
                                                                    }}
                                                                />
                                                            </Box>
                                                        )}
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
                                                                    {address.type}
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
                                                                    {address.address}
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
                                                                {!address.isDefault && (
                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        startIcon={<StarOutlineIcon />}
                                                                        sx={{
                                                                            borderRadius: 1,
                                                                            textTransform: 'none',
                                                                            fontWeight: 500,
                                                                            flex: 1,
                                                                            borderColor: 'warning.main',
                                                                            color: 'warning.main',
                                                                            '&:hover': {
                                                                                borderColor: 'warning.dark',
                                                                                bgcolor: 'warning.50',
                                                                            },
                                                                        }}
                                                                    >
                                                                        Set as Default
                                                                    </Button>
                                                                )}
                                                                <IconButton
                                                                    onClick={() => handleDeleteAddress(address.id)}
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
                                        </Grid>
                                    )}
                                    {activeTab === 2 && (
                                        <Grid container spacing={3}>
                                            {cards.map((card) => (
                                                <Grid item xs={12} sm={6} key={card.id}>
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
                                                                    <CreditCardIcon
                                                                        sx={{
                                                                            color: 'primary.main',
                                                                            fontSize: 24,
                                                                        }}
                                                                    />
                                                                    {card.type}
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
                                                                    •••• •••• •••• {card.last4}
                                                                    <br />
                                                                    Expires: {card.expiry}
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
                                                                    onClick={() => handleEditCard(card)}
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
                                                                    onClick={() => handleDeleteCard(card.id)}
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

                                            {/* Add New Card Card */}
                                            <Grid item xs={12} sm={6}>
                                                <Card
                                                    onClick={() => {
                                                        setOpenCardDialog(true);
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
                                                                Add New Card
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                }}
                                                            >
                                                                Click to add a new payment method
                                                            </Typography>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                    )}

                                    {activeTab === 3 && (
                                        <Box sx={{ maxWidth: 600 }}>
                                            <List sx={{
                                                bgcolor: 'background.paper',
                                                borderRadius: 2,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                            }}>
                                                {[
                                                    {
                                                        id: 'emailNotifications',
                                                        title: 'Email Notifications',
                                                        description: 'Receive notifications via email'
                                                    },
                                                    {
                                                        id: 'orderUpdates',
                                                        title: 'Order Updates',
                                                        description: 'Get notified about your order status'
                                                    },
                                                    {
                                                        id: 'promotions',
                                                        title: 'Promotions',
                                                        description: 'Receive promotional offers and deals'
                                                    },
                                                    {
                                                        id: 'newsletter',
                                                        title: 'Newsletter',
                                                        description: 'Subscribe to our newsletter'
                                                    }
                                                ].map((item, index) => (
                                                    <ListItem
                                                        key={item.id}
                                                        sx={{
                                                            borderBottom:
                                                                index !== 3 ? '1px solid' : 'none',
                                                            borderColor: 'divider',
                                                            py: 2
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={item.title}
                                                            secondary={item.description}
                                                            primaryTypographyProps={{
                                                                fontWeight: 500,
                                                                mb: 0.5
                                                            }}
                                                        />
                                                        <ListItemSecondaryAction>
                                                            <Switch
                                                                edge="end"
                                                                checked={notificationPreferences[item.id]}
                                                                onChange={() => handleNotificationChange(item.id)}
                                                                color="primary"
                                                            />
                                                        </ListItemSecondaryAction>
                                                    </ListItem>
                                                ))}
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

            {/* Add Card Dialog */}
            <Dialog
                open={openCardDialog}
                onClose={() => setOpenCardDialog(false)}
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
                    Add New Card
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Card Number"
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
                                    label="Expiry Date"
                                    placeholder="MM/YY"
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
                                    label="CVV"
                                    type="password"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{
                    p: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    mt: 3
                }}>
                    <Button
                        onClick={() => setOpenCardDialog(false)}
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
                        onClick={() => setOpenCardDialog(false)}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 3,
                            borderRadius: 1,
                        }}
                    >
                        Add Card
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Card Dialog */}
            <Dialog
                open={openEditCardDialog}
                onClose={handleCloseCardDialog}
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
                    Edit Card
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Card Number"
                            name="cardNumber"
                            value={cardFormData.cardNumber}
                            disabled
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
                                    label="Expiry Date"
                                    name="expiryDate"
                                    placeholder="MM/YY"
                                    value={cardFormData.expiryDate}
                                    onChange={handleCardFormChange}
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
                                    label="CVV"
                                    name="cvv"
                                    type="password"
                                    value={cardFormData.cvv}
                                    onChange={handleCardFormChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{
                    p: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    mt: 3
                }}>
                    <Button
                        onClick={handleCloseCardDialog}
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
                        onClick={handleSaveCard}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 3,
                            borderRadius: 1,
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Profile;