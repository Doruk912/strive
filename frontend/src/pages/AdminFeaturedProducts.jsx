import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Switch,
    FormControlLabel,
    Button,
    Snackbar,
    Alert,
} from '@mui/material';
import { products } from '../mockData/Products';

const FeaturedProducts = () => {
    const [featuredProducts, setFeaturedProducts] = useState(
        products.map(p => ({ ...p, isFeatured: false }))
    );
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleToggleFeatured = (productId) => {
        setFeaturedProducts(prev =>
            prev.map(p =>
                p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p
            )
        );
    };

    const handleSave = () => {
        // Here you would typically make an API call to save the featured products
        console.log('Featured products:', featuredProducts.filter(p => p.isFeatured));
        setOpenSnackbar(true);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Featured Products</Typography>
                <Button variant="contained" onClick={handleSave}>
                    Save Changes
                </Button>
            </Box>

            <Grid container spacing={3}>
                {featuredProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="200"
                                image={product.image}
                                alt={product.name}
                                sx={{ objectFit: 'cover' }}
                            />
                            <CardContent>
                                <Typography variant="h6">{product.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    ${product.price}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={product.isFeatured}
                                            onChange={() => handleToggleFeatured(product.id)}
                                        />
                                    }
                                    label="Featured"
                                />
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
            >
                <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
                    Featured products updated successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FeaturedProducts;