import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
    return (
        <Box sx={{ bgcolor: 'white', color: 'black', py: 4, mt: 'auto', borderTop: '1px solid #ddd' }}>
            <Container maxWidth="lg">
                {/* Footer Bottom Section */}
                <Box sx={{ textAlign: 'center' }}>
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