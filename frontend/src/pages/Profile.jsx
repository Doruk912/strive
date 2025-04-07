import React, { useState } from 'react';
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
    CardActions,
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
    FormControl,
    InputLabel,
    Select,
    MenuItem, ListItemIcon,
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
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Helmet } from "react-helmet";

const Profile = () => {
    const { user, login } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [openAddressDialog, setOpenAddressDialog] = useState(false);
    const [openCardDialog, setOpenCardDialog] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phone || '',
        countryCode: user?.countryCode || '+90',
    });
    const [phoneError, setPhoneError] = useState('');

    // Get user's full name from user context
    const userFullName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user?.name || 'User';

    // Mock data for addresses and cards (replace with actual data from backend)
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

    // Redirect if not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const validatePhoneNumber = (phone) => {
        // If phone is empty, it's valid (optional field)
        if (!phone || phone.trim() === '') {
            setPhoneError('');
            return true;
        }

        const cleanPhone = phone.replace(/\D/g, '');

        // Check if the length is valid when a number is provided
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            setPhoneError('Please enter a valid phone number');
            return false;
        }

        setPhoneError('');
        return true;
    };

    const formatPhoneNumber = (phone) => {
        // Remove non-digits and spaces
        const cleaned = phone.replace(/\D/g, '');

        // Only take first 10 digits
        const digits = cleaned.slice(0, 10);

        // Format as XXX XXX XX XX
        let formatted = '';
        for (let i = 0; i < digits.length; i++) {
            if (i === 3 || i === 6 || i === 8) formatted += ' ';
            formatted += digits[i];
        }
        return formatted;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phoneNumber') {
            // Only allow digits
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

    const handleSubmit = async () => {
        console.log('Submit button clicked');
        console.log('Current user:', user);
        console.log('Form data:', formData);
        setErrorMessage(''); // Clear any previous errors

        // Only validate phone if it's not empty
        if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
            return;
        }

        if (!user?.userId) {
            setErrorMessage('User ID not found. Please try logging in again.');
            return;
        }

        if (!user?.token) {
            setErrorMessage('Authentication token not found. Please log in again.');
            return;
        }

        try {
            const apiUrl = 'http://localhost:8080/api/users/' + user.userId;
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
                    phone: formData.phoneNumber.trim() || null,
                }),
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('You are not authorized to perform this action. Please log in again.');
                }
                throw new Error(`Failed to update profile: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Response data:', responseData);

            login({ ...user, ...responseData }); // Update the user context
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setShowSuccess(false);
            setErrorMessage(error.message || 'Failed to update profile. Please try again.');
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleNotificationChange = (preference) => {
        setNotificationPreferences(prev => ({
            ...prev,
            [preference]: !prev[preference]
        }));
    };

    const handleAddAddress = () => {
        setOpenAddressDialog(true);
    };

    const handleAddCard = () => {
        setOpenCardDialog(true);
    };

    const handleDeleteAddress = (id) => {
        setAddresses(prev => prev.filter(addr => addr.id !== id));
    };

    const handleDeleteCard = (id) => {
        setCards(prev => prev.filter(card => card.id !== id));
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
                                    {(activeTab === 1 || activeTab === 2) && (
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={activeTab === 1 ? handleAddAddress : handleAddCard}
                                            sx={{
                                                px: 4,
                                                py: 1.5,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 500,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                }
                                            }}
                                        >
                                            Add New {activeTab === 1 ? 'Address' : 'Card'}
                                        </Button>
                                    )}
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
                                                                country={'tr'}
                                                                value={formData.countryCode.replace('+', '')}
                                                                onChange={(value, country) => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        countryCode: '+' + country.dialCode
                                                                    }));
                                                                }}
                                                                inputProps={{
                                                                    style: {
                                                                        width: '100%',
                                                                        height: '56px',
                                                                        fontSize: '16px',
                                                                        borderRadius: '4px',
                                                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                                                        cursor: 'pointer' // Add cursor pointer to indicate it's clickable
                                                                    },
                                                                    readOnly: true, // Prevent keyboard input
                                                                    onClick: () => {
                                                                        // Programmatically open the dropdown when clicked
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
                                        <Grid container spacing={2}>
                                            {addresses.map((address) => (
                                                <Grid item xs={12} key={address.id}>
                                                    <Card
                                                        sx={{
                                                            borderRadius: 2,
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                            '&:hover': {
                                                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                            },
                                                            position: 'relative',
                                                            overflow: 'visible'
                                                        }}
                                                    >
                                                        {address.isDefault && (
                                                            <Chip
                                                                label="Default"
                                                                color="primary"
                                                                size="small"
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: -10,
                                                                    right: 16,
                                                                    fontWeight: 500,
                                                                }}
                                                            />
                                                        )}
                                                        <CardContent sx={{ pt: 3 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                                <LocationIcon sx={{
                                                                    mr: 1,
                                                                    color: 'primary.main',
                                                                    fontSize: 24
                                                                }} />
                                                                <Typography variant="h6" sx={{
                                                                    fontWeight: 600,
                                                                    fontSize: '1.1rem'
                                                                }}>
                                                                    {address.type}
                                                                </Typography>
                                                            </Box>
                                                            <Typography
                                                                variant="body1"
                                                                color="text.secondary"
                                                                sx={{ ml: 4 }}
                                                            >
                                                                {address.address}
                                                            </Typography>
                                                        </CardContent>
                                                        <CardActions sx={{
                                                            px: 2,
                                                            pb: 2,
                                                            borderTop: '1px solid',
                                                            borderColor: 'divider',
                                                            mt: 1
                                                        }}>
                                                            <Button
                                                                size="small"
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontWeight: 500,
                                                                    color: 'primary.main'
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                onClick={() => handleDeleteAddress(address.id)}
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontWeight: 500,
                                                                    color: 'error.main'
                                                                }}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </CardActions>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                    {activeTab === 2 && (
                                        <Grid container spacing={2}>
                                            {cards.map((card) => (
                                                <Grid item xs={12} sm={6} key={card.id}>
                                                    <Card
                                                        sx={{
                                                            borderRadius: 2,
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                            '&:hover': {
                                                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                            },
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                        }}
                                                    >
                                                        <CardContent sx={{ flex: 1 }}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                mb: 2,
                                                                pb: 2,
                                                                borderBottom: '1px solid',
                                                                borderColor: 'divider'
                                                            }}>
                                                                <CreditCardIcon sx={{
                                                                    mr: 1,
                                                                    color: 'primary.main',
                                                                    fontSize: 28
                                                                }} />
                                                                <Typography variant="h6" sx={{
                                                                    fontWeight: 600,
                                                                    fontSize: '1.1rem'
                                                                }}>
                                                                    {card.type}
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="body1" sx={{ mb: 1 }}>
                                                                •••• •••• •••• {card.last4}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Expires: {card.expiry}
                                                            </Typography>
                                                        </CardContent>
                                                        <CardActions sx={{
                                                            p: 2,
                                                            pt: 1,
                                                            borderTop: '1px solid',
                                                            borderColor: 'divider'
                                                        }}>
                                                            <Button
                                                                size="small"
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontWeight: 500,
                                                                    color: 'primary.main'
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                onClick={() => handleDeleteCard(card.id)}
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontWeight: 500,
                                                                    color: 'error.main'
                                                                }}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </CardActions>
                                                    </Card>
                                                </Grid>
                                            ))}
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
            <Dialog
                open={openAddressDialog}
                onClose={() => setOpenAddressDialog(false)}
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
                    Add New Address
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Address Type</InputLabel>
                            <Select
                                label="Address Type"
                                sx={{ borderRadius: 1 }}
                            >
                                <MenuItem value="home">Home</MenuItem>
                                <MenuItem value="work">Work</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Street Address"
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
                    pt: 0,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    mt: 3
                }}>
                    <Button
                        onClick={() => setOpenAddressDialog(false)}
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
                        onClick={() => setOpenAddressDialog(false)}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 3,
                            borderRadius: 1,
                        }}
                    >
                        Save Address
                    </Button>
                </DialogActions>
            </Dialog>

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
                    pt: 0,
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
        </>
    );
}

export default Profile;