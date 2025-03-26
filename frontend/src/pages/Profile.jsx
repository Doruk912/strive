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
    Tabs,
    Tab,
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
    MenuItem,
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
    const [openAddressDialog, setOpenAddressDialog] = useState(false);
    const [openCardDialog, setOpenCardDialog] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        countryCode: user?.countryCode || '+1',
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
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phone) {
            setPhoneError('Phone number is required');
            return false;
        }
        if (!phoneRegex.test(phone)) {
            setPhoneError('Please enter a valid phone number');
            return false;
        }
        setPhoneError('');
        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'phoneNumber') {
            validatePhoneNumber(value);
        }
    };

    const handleSubmit = () => {
        if (!validatePhoneNumber(formData.phoneNumber)) {
            return;
        }
        // Here you would typically make an API call to update the user's information
        login({ ...user, ...formData }); // Update the user context
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
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
                    minHeight: '90vh',
                    backgroundImage: `url('https://images.pexels.com/photos/9269539/pexels-photo-9269539.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'top center',
                    backgroundRepeat: 'no-repeat',
                    display: 'flex',
                    alignItems: 'flex-start',
                    pt: { xs: 4, sm: 6, md: 8 },
                    pb: 4,
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.4))',
                        zIndex: 1,
                    }
                }}
                mt={-4}
                mb={-3}
            >
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
                    {showSuccess && (
                        <Alert 
                            severity="success" 
                            sx={{ 
                                mb: 2,
                                borderRadius: 2,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                        >
                            Profile updated successfully!
                        </Alert>
                    )}

                    <Paper 
                        elevation={2} 
                        sx={{
                            p: { xs: 2, sm: 4 },
                            borderRadius: 3,
                            maxWidth: '800px',
                            margin: '0 auto',
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        }}
                    >
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'row',
                            alignItems: 'center',
                            mb: 4,
                            gap: 3,
                            position: 'relative',
                        }}>
                            <Avatar
                                sx={{
                                    width: { xs: 80, sm: 100 },
                                    height: { xs: 80, sm: 100 },
                                    bgcolor: 'primary.main',
                                    fontSize: { xs: '2rem', sm: '2.5rem' },
                                    border: '4px solid white',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    flexShrink: 0,
                                }}
                            >
                                {userFullName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ 
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                            }}>
                                <Typography variant="h4" gutterBottom sx={{ 
                                    fontSize: { xs: '1.5rem', sm: '2rem' },
                                    fontWeight: 600,
                                    color: '#1a1a1a',
                                }}>
                                    {userFullName}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ 
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}>
                                    <Chip 
                                        label={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} 
                                        size="small" 
                                        color="primary"
                                        sx={{ 
                                            fontWeight: 500,
                                            '& .MuiChip-label': {
                                                px: 1,
                                            }
                                        }}
                                    />
                                </Typography>
                            </Box>
                        </Box>

                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                mb: 3,
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    minWidth: { xs: 'auto', sm: '160px' },
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                    color: 'text.secondary',
                                    '&.Mui-selected': {
                                        color: 'primary.main',
                                        fontWeight: 600,
                                    },
                                },
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                },
                            }}
                        >
                            <Tab icon={<PersonIcon />} label="Profile Details" />
                            <Tab icon={<LocationIcon />} label="Addresses" />
                            <Tab icon={<CreditCardIcon />} label="Payment Methods" />
                            <Tab icon={<NotificationsIcon />} label="Notifications" />
                        </Tabs>

                        {activeTab === 0 && (
                            <Box>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    mb: 3,
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Personal Information
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={handleSubmit}
                                        disabled={!!phoneError}
                                        sx={{
                                            px: 4,
                                            py: 1,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                                            '&:hover': {
                                                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                                            }
                                        }}
                                    >
                                        Save Changes
                                    </Button>
                                </Box>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="First Name"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: 'primary.main',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Last Name"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: 'primary.main',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
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
                                                    '&:hover fieldset': {
                                                        borderColor: 'primary.main',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <PhoneInput
                                            country={'tr'}
                                            value={formData.phoneNumber}
                                            onChange={(phone, country) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    phoneNumber: phone,
                                                    countryCode: '+' + country.dialCode
                                                }));
                                                validatePhoneNumber(phone);
                                            }}
                                            inputStyle={{
                                                width: '100%',
                                                height: '56px',
                                                fontSize: '16px',
                                                borderRadius: '4px',
                                                border: '1px solid rgba(0, 0, 0, 0.23)',
                                                backgroundColor: 'white',
                                            }}
                                            buttonStyle={{
                                                border: '1px solid rgba(0, 0, 0, 0.23)',
                                                borderRight: 'none',
                                                backgroundColor: 'white',
                                                borderRadius: '4px 0 0 4px',
                                            }}
                                            dropdownStyle={{
                                                backgroundColor: 'white',
                                                borderRadius: '4px',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            }}
                                            containerStyle={{
                                                width: '100%',
                                            }}
                                            enableSearch={true}
                                            searchPlaceholder="Search country..."
                                            searchNotFound="No country found"
                                            specialLabel=""
                                        />
                                        {phoneError && (
                                            <Typography color="error" variant="caption" sx={{ mt: 1, ml: 2 }}>
                                                {phoneError}
                                            </Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {activeTab === 1 && (
                            <Box>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    mb: 3,
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Saved Addresses
                                    </Typography>
                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={handleAddAddress}
                                        variant="outlined"
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            px: 3,
                                        }}
                                    >
                                        Add New Address
                                    </Button>
                                </Box>
                                <Grid container spacing={2}>
                                    {addresses.map((address) => (
                                        <Grid item xs={12} key={address.id}>
                                            <Card
                                                sx={{
                                                    borderRadius: 2,
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                    '&:hover': {
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                    }
                                                }}
                                            >
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                        <Typography variant="subtitle1" sx={{ mr: 1, fontWeight: 600 }}>
                                                            {address.type}
                                                        </Typography>
                                                        {address.isDefault && (
                                                            <Chip
                                                                label="Default"
                                                                size="small"
                                                                color="primary"
                                                                sx={{ 
                                                                    mr: 1,
                                                                    fontWeight: 500,
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                                                        {address.address}
                                                    </Typography>
                                                </CardContent>
                                                <CardActions sx={{ px: 2, pb: 2 }}>
                                                    <Button 
                                                        size="small" 
                                                        color="primary"
                                                        sx={{ textTransform: 'none', fontWeight: 500 }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteAddress(address.id)}
                                                        sx={{ textTransform: 'none', fontWeight: 500 }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {activeTab === 2 && (
                            <Box>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    mb: 3,
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Payment Methods
                                    </Typography>
                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={handleAddCard}
                                        variant="outlined"
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            px: 3,
                                        }}
                                    >
                                        Add New Card
                                    </Button>
                                </Box>
                                <Grid container spacing={2}>
                                    {cards.map((card) => (
                                        <Grid item xs={12} sm={6} key={card.id}>
                                            <Card
                                                sx={{
                                                    borderRadius: 2,
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                    '&:hover': {
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                    }
                                                }}
                                            >
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <CreditCardIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                            {card.type} ending in {card.last4}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                                                        Expires {card.expiry}
                                                    </Typography>
                                                </CardContent>
                                                <CardActions sx={{ px: 2, pb: 2 }}>
                                                    <Button 
                                                        size="small" 
                                                        color="primary"
                                                        sx={{ textTransform: 'none', fontWeight: 500 }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteCard(card.id)}
                                                        sx={{ textTransform: 'none', fontWeight: 500 }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {activeTab === 3 && (
                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                    Notification Preferences
                                </Typography>
                                <List sx={{ 
                                    bgcolor: 'background.paper',
                                    borderRadius: 2,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                }}>
                                    <ListItem sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <ListItemText
                                            primary="Email Notifications"
                                            secondary="Receive notifications via email"
                                            primaryTypographyProps={{ fontWeight: 500 }}
                                        />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                edge="end"
                                                checked={notificationPreferences.emailNotifications}
                                                onChange={() => handleNotificationChange('emailNotifications')}
                                                color="primary"
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <ListItem sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <ListItemText
                                            primary="Order Updates"
                                            secondary="Get notified about your order status"
                                            primaryTypographyProps={{ fontWeight: 500 }}
                                        />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                edge="end"
                                                checked={notificationPreferences.orderUpdates}
                                                onChange={() => handleNotificationChange('orderUpdates')}
                                                color="primary"
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <ListItem sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <ListItemText
                                            primary="Promotions"
                                            secondary="Receive promotional offers and deals"
                                            primaryTypographyProps={{ fontWeight: 500 }}
                                        />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                edge="end"
                                                checked={notificationPreferences.promotions}
                                                onChange={() => handleNotificationChange('promotions')}
                                                color="primary"
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Newsletter"
                                            secondary="Subscribe to our newsletter"
                                            primaryTypographyProps={{ fontWeight: 500 }}
                                        />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                edge="end"
                                                checked={notificationPreferences.newsletter}
                                                onChange={() => handleNotificationChange('newsletter')}
                                                color="primary"
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </List>
                            </Box>
                        )}
                    </Paper>
                </Container>
            </Box>

            {/* Add Address Dialog */}
            <Dialog 
                open={openAddressDialog} 
                onClose={() => setOpenAddressDialog(false)}
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
                }}>
                    Add New Address
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Address Type</InputLabel>
                            <Select label="Address Type">
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
                            sx={{ mb: 2 }}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="City" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="State/Province" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Postal Code" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Country" />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                        onClick={() => setOpenAddressDialog(false)}
                        sx={{ textTransform: 'none', fontWeight: 500 }}
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
                            borderRadius: 2,
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
                }}>
                    Add New Card
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Card Number"
                            sx={{ mb: 2 }}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Expiry Date" placeholder="MM/YY" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="CVV" type="password" />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                        onClick={() => setOpenCardDialog(false)}
                        sx={{ textTransform: 'none', fontWeight: 500 }}
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
                            borderRadius: 2,
                        }}
                    >
                        Add Card
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Profile;