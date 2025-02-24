import React from 'react';
import { Container, Typography, Grid, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Welcome to Sports Store
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                    Your one-stop destination for quality sports equipment and accessories
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/products')}
                    sx={{ mt: 2 }}
                >
                    Shop Now
                </Button>
            </Box>

            <Grid container spacing={4} sx={{ mt: 4 }}>
                <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>
                        Quality Equipment
                    </Typography>
                    <Typography>
                        Browse our selection of professional-grade sports equipment.
                    </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>
                        Best Prices
                    </Typography>
                    <Typography>
                        Competitive prices on all your favorite sports gear.
                    </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>
                        Expert Advice
                    </Typography>
                    <Typography>
                        Get guidance from our sports equipment specialists.
                    </Typography>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Home;