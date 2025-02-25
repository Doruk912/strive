import React from 'react';
import { Box, Container, Grid, Typography, Link } from '@mui/material';

const Footer = () => {
    return (
        <Box sx={{ bgcolor: '#333', color: 'white', py: 4, mt: 'auto' }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom>
                            About Us
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            Your one-stop shop for all sports accessories and equipment.
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom>
                            Quick Links
                        </Typography>
                        <Link href="#" color="inherit" display="block" sx={{ mb: 1, '&:hover': { color: '#007bff' } }}>
                            Sports
                        </Link>
                        <Link href="#" color="inherit" display="block" sx={{ mb: 1, '&:hover': { color: '#007bff' } }}>
                            Equipment
                        </Link>
                        <Link href="#" color="inherit" display="block" sx={{ mb: 1, '&:hover': { color: '#007bff' } }}>
                            Clothing
                        </Link>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom>
                            Contact Us
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            Email: <Link href="mailto:contact@sportsstore.com" color="inherit" sx={{ '&:hover': { color: '#007bff' } }}>contact@sportsstore.com</Link><br />
                            Phone: <Link href="tel:1234567890" color="inherit" sx={{ '&:hover': { color: '#007bff' } }}>(123) 456-7890</Link>
                        </Typography>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Footer;