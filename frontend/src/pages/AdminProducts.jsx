import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardMedia,
    CardContent,
    Grid,
    Switch,
    FormControlLabel,
} from '@mui/material';
import { products } from '../../mockData/Products';

const FeaturedProducts = () => {
    const [featuredProducts, setFeaturedProducts] = useState(
        products.map(p => ({ ...p, isFeatured: false }))
    );

    const handleToggleFeatured = (productId) => {
        setFeaturedProducts(prev =>
            prev.map(p =>
                p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p
            )
        );
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Featured Products Management
            </Typography>

            <Grid container spacing={3}>
                {featuredProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="200"
                                image={product.image}
                                alt={product.name}
                            />
                            <CardContent>
                                <Typography variant="h6">{product.name}</Typography>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={product.isFeatured}
                                            onChange={() => handleToggleFeatured(product.id)}
                                        />
                                    }
                                    label="Featured"
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default FeaturedProducts;