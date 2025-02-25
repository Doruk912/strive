import React from 'react';
import { Container, Typography, Grid, Box, Card, CardContent, CardMedia } from '@mui/material';
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
        <Container maxWidth="lg" sx={{ px: 0 }}>
            {/* Hero Section with Full-Width Video */}
            <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2, boxShadow: 1 }}>
                <CardMedia
                    component="video"
                    src="/video.mp4"
                    autoPlay
                    loop
                    muted
                    sx={{ width: '100%', height: 'auto', minHeight: '500px' }}
                />
            </Box>

            {/* Featured Products */}
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
    );
};

export default Home;