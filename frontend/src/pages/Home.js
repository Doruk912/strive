import React from 'react';
import { Container, Typography, Grid, Box, Card, CardContent, CardMedia, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const featuredProducts = [
    {
        id: 1,
        name: 'Basketball',
        description: 'Professional grade basketball',
        price: 29.99,
        image: '/api/placeholder/300/200',
    },
    {
        id: 2,
        name: 'Soccer Ball',
        description: 'FIFA approved soccer ball',
        price: 24.99,
        image: '/api/placeholder/300/200',
    },
    {
        id: 3,
        name: 'Tennis Racket',
        description: 'Lightweight tennis racket',
        price: 89.99,
        image: '/api/placeholder/300/200',
    },
];

const Home = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ width: '100%' }}>
            {/* Hero Section with Full-Width Video and Text Overlay */}
            <Box sx={{ position: 'relative', overflow: 'hidden', mb: 4 }}>
                <CardMedia
                    component="video"
                    src="/video.mp4"
                    autoPlay
                    loop
                    muted
                    sx={{ width: '100%', height: 'auto', minHeight: '500px' }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        color: '#fff',
                        p: 4,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Discover Our Latest Collection
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Premium sports accessories for every athlete
                    </Typography>
                    <Button
                        onClick={() => navigate('/products')}
                        sx={{
                            mt: 2,
                            color: '#ffffff',
                            backgroundColor: 'transparent',
                            border: '1px solid #ffffff',
                            borderRadius: '2px', // Very subtle rounded corners
                            padding: '8px 20px',
                            fontSize: '14px',
                            fontWeight: 400,
                            textTransform: 'none',
                            letterSpacing: '0.5px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle white overlay on hover
                                border: '1px solid #ffffff',
                            },
                        }}
                    >
                        Browse Products
                    </Button>
                </Box>
            </Box>

            {/* Featured Products */}
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Featured Products
                    </Typography>
                    <Grid container spacing={4}>
                        {featuredProducts.map((product) => (
                            <Grid item xs={12} sm={6} md={4} key={product.id}>
                                <Card sx={{ boxShadow: 1, borderRadius: 2 }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={product.image}
                                        alt={product.name}
                                    />
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {product.name}
                                        </Typography>
                                        <Typography color="text.secondary" paragraph>
                                            {product.description}
                                        </Typography>
                                        <Typography variant="h6" color="primary">
                                            ${product.price}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default Home;