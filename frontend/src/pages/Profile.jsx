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
    Divider,
    IconButton,
    Alert,
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import {Helmet} from "react-helmet";

const Profile = () => {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });

    // Redirect if not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = () => {
        // Here you would typically make an API call to update the user's information
        login({ ...user, ...formData }); // Update the user context
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <>
            <Helmet>
                <title>Strive - Profile</title>
            </Helmet>
        <Box
            sx={{
                height: '90vh',
                backgroundImage: `url('https://images.pexels.com/photos/9269539/pexels-photo-9269539.jpeg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'top center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'flex-start',
                pt: 20,
                pb: 0,
            }}
            mt={-4}
            mb={-3}
        >
            <Container maxWidth="md">
                {showSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Profile updated successfully!
                    </Alert>
                )}

                <Paper elevation={3} sx={{
                    p: 4,
                    borderRadius: 2,
                    maxWidth: '800px',
                    margin: '0 auto',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                bgcolor: 'primary.main',
                                fontSize: '2.5rem',
                            }}
                        >
                            {formData.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ ml: 3 }}>
                            <Typography variant="h4" gutterBottom>
                                {formData.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Account
                            </Typography>
                        </Box>
                        <IconButton
                            sx={{ ml: 'auto' }}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? <CancelIcon /> : <EditIcon />}
                        </IconButton>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                variant={isEditing ? "outlined" : "filled"}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                variant={isEditing ? "outlined" : "filled"}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                variant={isEditing ? "outlined" : "filled"}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                                variant={isEditing ? "outlined" : "filled"}
                            />
                        </Grid>
                    </Grid>

                    {isEditing && (
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSubmit}
                                sx={{ ml: 2 }}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
            </>
    );
};

export default Profile;