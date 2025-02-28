// src/pages/Admin.jsx
import React from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    Grid,
    Card,
    CardContent,
    CardHeader,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Admin = () => {
    const { user } = useAuth();

    // Redirect if not admin
    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Admin Dashboard
                </Typography>

                <Grid container spacing={3}>
                    {/* Summary Cards */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Orders
                                </Typography>
                                <Typography variant="h5">150</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Users
                                </Typography>
                                <Typography variant="h5">1,250</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Products
                                </Typography>
                                <Typography variant="h5">89</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Revenue
                                </Typography>
                                <Typography variant="h5">$15,350</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent Orders */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Recent Orders
                            </Typography>
                            {/* Add table or list of recent orders */}
                        </Paper>
                    </Grid>

                    {/* Other admin sections */}
                </Grid>
            </Box>
        </Container>
    );
};

export default Admin;