import React from 'react';
import { Box, Container, Grid, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // Import RouterLink for navigation

const Footer = () => {
    return (
        <Box sx={{ bgcolor: 'white', color: 'black', py: 4, mt: 'auto', borderTop: '1px solid #ddd' }}>
            <Container maxWidth="lg">
                {/* Footer Sections */}
                <Grid container spacing={4} justifyContent="center">
                    {/* Resources Section */}
                    <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            Resources
                        </Typography>
                        <Link href="https://g.co/kgs/jR7d5vU" color="inherit" display="block" sx={{ mb: 1, '&:hover': { color: '#007bff' } }} target="_blank" rel="noopener noreferrer">
                            Help
                        </Link>
                        <Link href="https://g.co/kgs/jR7d5vU" color="inherit" display="block" sx={{ mb: 1, '&:hover': { color: '#007bff' } }} target="_blank" rel="noopener noreferrer">
                            Store Locator
                        </Link>
                        <Link href="https://g.co/kgs/jR7d5vU" color="inherit" display="block" sx={{ mb: 1, '&:hover': { color: '#007bff' } }} target="_blank" rel="noopener noreferrer">
                            About Us
                        </Link>
                    </Grid>

                    {/* Company Section */}
                    <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            Company
                        </Typography>
                        <Link component={RouterLink} to="/careers" color="inherit" display="block" sx={{ mb: 1, '&:hover': { color: '#007bff' } }}>
                            Careers
                        </Link>
                        <Link component={RouterLink} to="/investors" color="inherit" display="block" sx={{ mb: 1, '&:hover': { color: '#007bff' } }}>
                            Investors
                        </Link>
                        <Link component={RouterLink} to="/sustainability" color="inherit" display="block" sx={{ mb: 1, '&:hover': { color: '#007bff' } }}>
                            Sustainability
                        </Link>
                    </Grid>

                    {/* Support Section */}
                    <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            Support
                        </Typography>
                        <Link href="https://g.co/kgs/jR7d5vU" color="inherit" display="block" sx={{ mb: 1, '&:hover': { color: '#007bff' } }} target="_blank" rel="noopener noreferrer">
                            Feedback
                        </Link>
                        <Link href="https://g.co/kgs/jR7d5vU" color="inherit" display="block" sx={{ mb: 1, '&:hover': { color: '#007bff' } }} target="_blank" rel="noopener noreferrer">
                            Returns
                        </Link>
                        <Link href="https://g.co/kgs/jR7d5vU" color="inherit" display="block" sx={{ mb: 1, '&:hover': { color: '#007bff' } }} target="_blank" rel="noopener noreferrer">
                            Contact Us
                        </Link>
                    </Grid>
                </Grid>

                {/* Footer Bottom Section */}
                <Box sx={{ borderTop: '1px solid #ddd', pt: 3, mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2">
                        © 2025 Strive, Inc. All Rights Reserved
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        <Link component={RouterLink} to="/terms" color="inherit" sx={{ mx: 1, '&:hover': { color: '#007bff' } }}>
                            Terms of Use
                        </Link>
                        <Link component={RouterLink} to="/terms" color="inherit" sx={{ mx: 1, '&:hover': { color: '#007bff' } }}>
                            Sales Terms
                        </Link>
                        <Link component={RouterLink} to="/terms" color="inherit" sx={{ mx: 1, '&:hover': { color: '#007bff' } }}>
                            Privacy Policy
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
