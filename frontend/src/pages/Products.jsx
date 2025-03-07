import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grid,
    Typography,
    Box,
    Card,
    CardMedia,
    IconButton,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { products } from '../mockData/Products';
import { useFavorites } from '../context/FavoritesContext';

const Products = () => {
    const navigate = useNavigate();
    const { favoriteItems, addToFavorites, removeFromFavorites } = useFavorites();
    const [filters, setFilters] = useState({
        category: [],
        sportGroup: [],
    });

    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: prev[filterType].includes(value)
                ? prev[filterType].filter((item) => item !== value)
                : [...prev[filterType], value],
        }));
    };

    const isFavorite = (productId) => favoriteItems.some(item => item.id === productId);

    const toggleFavorite = (product) => {
        if (isFavorite(product.id)) {
            removeFromFavorites(product.id);
        } else {
            addToFavorites(product);
        }
    };

    const filteredProducts = products;

    return (
        <Box sx={{ width: '100%', mt: 4 }}>
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    fontWeight: 'bold',
                    mb: 4,
                    color: '#2B2B2B',
                    textAlign: 'left',
                    paddingLeft: '16px',
                }}
            >
                Sports Equipment
            </Typography>

            <Box sx={{ display: 'flex', width: '100%' }}>
                <Box
                    sx={{
                        width: '250px',
                        position: 'sticky',
                        top: 0,
                        height: '100vh',
                        overflowY: 'auto',
                        padding: '16px',
                        backgroundColor: '#ffffff',
                    }}
                >
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        Filter
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: '#2B2B2B' }}>
                            Category
                        </Typography>
                        {['Sports', 'Fitness', 'Accessories'].map((category) => (
                            <FormControlLabel
                                key={category}
                                control={
                                    <Checkbox
                                        checked={filters.category.includes(category)}
                                        onChange={() => handleFilterChange('category', category)}
                                        sx={{ color: '#2B2B2B' }}
                                    />
                                }
                                label={`${category} (${products.filter((p) => p.category === category).length})`}
                                sx={{ mb: 1, color: '#2B2B2B' }}
                            />
                        ))}
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: '#2B2B2B' }}>
                            Sport Group
                        </Typography>
                        {['Basketball', 'Soccer', 'Tennis', 'Baseball', 'Running', 'Yoga'].map((sport) => (
                            <FormControlLabel
                                key={sport}
                                control={
                                    <Checkbox
                                        checked={filters.sportGroup.includes(sport)}
                                        onChange={() => handleFilterChange('sportGroup', sport)}
                                        sx={{ color: '#2B2B2B' }}
                                    />
                                }
                                label={`${sport} (${products.filter((p) => p.name.includes(sport)).length})`}
                                sx={{ mb: 1, color: '#2B2B2B' }}
                            />
                        ))}
                    </Box>
                </Box>

                <Box sx={{ flex: 1, pl: 3, pr: 2 }}>
                    <Grid container spacing={3}>
                        {filteredProducts.map((product) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                <Card
                                    onClick={() => navigate(`/product/${product.id}`)}
                                    sx={{
                                        boxShadow: 'none',
                                        borderRadius: 0,
                                        background: 'transparent',
                                        position: 'relative',
                                        width: '100%',
                                        flexShrink: 0,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                                        },
                                    }}
                                >
                                    <IconButton
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            toggleFavorite(product);
                                        }}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            zIndex: 1,
                                            color: 'black', // Set color to black
                                            backgroundColor: 'transparent', // Set background color to transparent
                                            padding: '4px',
                                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                                            '&:hover': {
                                                backgroundColor: 'transparent', // Ensure hover background is transparent
                                            },
                                        }}
                                    >
                                        {isFavorite(product.id) ? (
                                            <FavoriteIcon sx={{ fontSize: '1.2rem' }} />
                                        ) : (
                                            <FavoriteBorderIcon sx={{ fontSize: '1.2rem' }} />
                                        )}
                                    </IconButton>

                                    <CardMedia
                                        component="img"
                                        image={product.image}
                                        alt={product.name}
                                        sx={{
                                            height: '240px',
                                            objectFit: 'cover',
                                            backgroundColor: '#f5f5f5',
                                        }}
                                    />

                                    <Box
                                        sx={{
                                            backgroundColor: '#868686',
                                            color: 'white',
                                            padding: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                            {product.name}
                                        </Typography>
                                        <Box
                                            sx={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'white' }}>
                                                ${product.price}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

export default Products;