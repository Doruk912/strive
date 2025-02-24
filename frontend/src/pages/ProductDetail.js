import React from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Grid,
    Typography,
    Button,
    Box,
    Rating,
    Chip,
} from '@mui/material';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const { dispatch } = useCart();

    // Mock product data - replace with API call
    const product = {
        id: id,
        name: 'Sample Product',
        description: 'This is a detailed description of the product.',
        price: 99.99,
        rating: 4.5,
        stock: 10,
        image: '/api/placeholder/500/300',
    };

    const handleAddToCart = () => {
        dispatch({ type: 'ADD_TO_CART', payload: product });
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '100%', height: 'auto' }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" gutterBottom>
                        {product.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating value={product.rating} readOnly />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                            ({product.rating} / 5)
                        </Typography>
                    </Box>

                    <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                        ${product.price}
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {product.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Chip
                            label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            color={product.stock > 0 ? 'success' : 'error'}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                    >
                        Add to Cart
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ProductDetail;