import React from 'react';
import { Container, Typography, Grid, Box, Card, CardContent, CardMedia, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { featuredProducts } from '../mockData/Products';

const Home = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ width: '100%', marginTop: '-30px' }}>
            {/* Hero Section with Full-Width Video and Text Overlay */}
            <Box
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    mb: 4,
                    height: {
                        xs: '500px', // Height for mobile
                        sm: '600px', // Height for tablet
                        md: '700px'  // Height for desktop
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        }
                    }}
                >
                    <CardMedia
                        component="video"
                        src="/video.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline // Important for iOS
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            minWidth: '100%',
                            minHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            transform: 'translate(-50%, -50%)',
                            objectFit: 'cover',
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        position: 'relative', // Changed to relative
                        zIndex: 1, // Ensure text appears above video
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: {
                            xs: 'center', // Center align on mobile
                            md: 'flex-start' // Left align on desktop
                        },
                        color: '#fff',
                        p: {
                            xs: 2, // Less padding on mobile
                            sm: 4, // More padding on larger screens
                        },
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            mb: 2,
                            textAlign: {
                                xs: 'center', // Center text on mobile
                                md: 'left' // Left align on desktop
                            },
                            fontSize: {
                                xs: '1.8rem', // Smaller font on mobile
                                sm: '2.125rem' // Regular h4 size on larger screens
                            }
                        }}
                    >
                        Discover Our Latest Collection
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 2,
                            textAlign: {
                                xs: 'center', // Center text on mobile
                                md: 'left' // Left align on desktop
                            },
                            fontSize: {
                                xs: '1.1rem', // Smaller font on mobile
                                sm: '1.25rem' // Regular h6 size on larger screens
                            }
                        }}
                    >
                        Premium sports accessories for every athlete
                    </Typography>
                    <Button
                        onClick={() => navigate('/products')}
                        sx={{
                            mt: 2,
                            color: '#ffffff',
                            backgroundColor: 'transparent',
                            border: '1px solid #ffffff',
                            borderRadius: '2px',
                            padding: '8px 20px',
                            fontSize: {
                                xs: '12px', // Smaller font on mobile
                                sm: '14px'  // Regular size on larger screens
                            },
                            fontWeight: 400,
                            textTransform: 'none',
                            letterSpacing: '0.5px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
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