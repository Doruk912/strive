// src/pages/Terms.jsx
import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { termsOfUse, salesTerms } from '../mockData/Texts'; // Import both contents

const Terms = () => {
    const location = useLocation();
    const isSalesTerms = location.pathname === '/sales-terms'; // Check the route

    const content = isSalesTerms ? salesTerms : termsOfUse; // Choose the content based on the route
    const title = isSalesTerms ? 'Sales Terms' : 'Terms of Use'; // Set the title dynamically

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
                {title}
            </Typography>
            <Box sx={{ lineHeight: 1.6, fontFamily: 'Arial, sans-serif', color: '#333' }}>
                <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
                    {content}
                </Typography>
            </Box>
        </Container>
    );
};

export default Terms;