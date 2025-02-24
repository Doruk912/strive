import React, { useState } from 'react';
import {
    Container,
    Grid,
    Typography,
    Box,
    TextField,
    MenuItem,
} from '@mui/material';
import ProductCard from '../components/product/ProductCard';

// Mock data - replace with API call
const mockProducts = [
    {
        id: 1,
        name: 'Basketball',
        description: 'Professional grade basketball',
        price: 29.99,
        rating: 4.5,
        image: '/api/placeholder/300/200',
    },
    {
        id: 2,
        name: 'Soccer Ball',
        description: 'FIFA approved soccer ball',
        price: 24.99,
        rating: 4.7,
        image: '/api/placeholder/300/200',
    },
    {
        id: 3,
        name: 'Tennis Racket',
        description: 'Lightweight tennis racket',
        price: 89.99,
        rating: 4.3,
        image: '/api/placeholder/300/200',
    },
    {
        id: 4,
        name: 'Baseball Glove',
        description: 'Leather baseball glove',
        price: 49.99,
        rating: 4.6,
        image: '/api/placeholder/300/200',
    },
    {
        id: 5,
        name: 'Running Shoes',
        description: 'Comfortable running shoes',
        price: 59.99,
        rating: 4.8,
        image: '/api/placeholder/300/200',
    },
    {
        id: 6,
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat',
        price: 19.99,
        rating: 4.4,
        image: '/api/placeholder/300/200',
    },
];

const Products = () => {
    const [sortBy, setSortBy] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = mockProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Sports Equipment
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Search products"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Sort by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <MenuItem value="name">Name</MenuItem>
                            <MenuItem value="price">Price</MenuItem>
                            <MenuItem value="rating">Rating</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Box>

            <Grid container spacing={3}>
                {filteredProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Products;