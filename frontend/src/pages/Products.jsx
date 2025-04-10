import React, { useState, useEffect } from 'react';
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
    Button,
    Tooltip,
    CircularProgress,
    Alert,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useFavorites } from '../context/FavoritesContext';
import { Helmet } from "react-helmet";
import axios from 'axios';

const Products = () => {
    const navigate = useNavigate();
    const { favoriteItems, addToFavorites, removeFromFavorites } = useFavorites();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: [],
        sportGroup: [],
        gender: [],
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/products');
            setProducts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: prev[filterType].includes(value)
                ? prev[filterType].filter((item) => item !== value)
                : [...prev[filterType], value],
        }));
    };

    const isFavorite = (productId) => favoriteItems.some(item => item.id === productId);

    // Apply filters to products
    const filteredProducts = products.filter(product => {
        const categoryMatch = filters.category.length === 0 || filters.category.includes(product.category);
        const genderMatch = filters.gender.length === 0 || filters.gender.includes(product.gender);
        // You can add more filter logic here as needed
        return categoryMatch && genderMatch;
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <>
            <Helmet>
                <title>Strive - Products</title>
            </Helmet>
        <Box sx={{ width: '100%', mt: 4 }}>
            <Typography
                variant="h4"
                sx={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    color: '#1a1a1a',
                    textAlign: 'left',
                    paddingLeft: '16px',
                    marginBottom: '1.5rem',
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-10px',
                        left: '16px',
                        width: '60px',
                        height: '3px',
                        backgroundColor: '#2E7D32',
                    }
                }}
            >
                Sports Equipment
            </Typography>

            <Box sx={{ display: 'flex', width: '100%' }}>
                <Box
                    sx={{
                        width: '280px',
                        position: 'sticky',
                        top: 0,
                        height: '100vh',
                        overflowY: 'auto',
                        padding: '24px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 0 20px rgba(0,0,0,0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.05)',
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1',
                            borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: '#c1c1c1',
                            borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: '#a8a8a8',
                        },
                    }}
                >
                    <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            color: '#1a1a1a',
                            mb: 3,
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: '-8px',
                                left: '0',
                                width: '40px',
                                height: '2px',
                                backgroundColor: '#2E7D32',
                            }
                        }}
                    >
                        Filter
                    </Typography>

                    <Box sx={{ mb: 4 }}>
                        <Typography 
                            variant="subtitle1" 
                            gutterBottom 
                            sx={{ 
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 600,
                                fontSize: '1rem',
                                color: '#2B2B2B',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                '&::before': {
                                    content: '""',
                                    display: 'inline-block',
                                    width: '4px',
                                    height: '16px',
                                    backgroundColor: '#2E7D32',
                                    marginRight: '8px',
                                    borderRadius: '2px',
                                }
                            }}
                        >
                            Category
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                            {['Sports', 'Fitness', 'Accessories'].map((category) => (
                                <FormControlLabel
                                    key={category}
                                    control={
                                        <Checkbox
                                            checked={filters.category.includes(category)}
                                            onChange={() => handleFilterChange('category', category)}
                                            sx={{ 
                                                color: '#2B2B2B',
                                                '&.Mui-checked': {
                                                    color: '#2E7D32',
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'rgba(46, 125, 50, 0.08)',
                                                },
                                                padding: '4px',
                                            }}
                                        />
                                    }
                                    label={
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            alignItems: 'center',
                                        }}>
                                            <Typography 
                                                sx={{ 
                                                    color: '#2B2B2B',
                                                    fontSize: '0.9rem',
                                                    fontWeight: filters.category.includes(category) ? 600 : 400,
                                                }}
                                            >
                                                {category}
                                            </Typography>
                                            <Typography 
                                                sx={{ 
                                                    color: '#888',
                                                    fontSize: '0.8rem',
                                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                }}
                                            >
                                                {products.filter((p) => p.category === category).length}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ 
                                        mb: 1.5, 
                                        color: '#2B2B2B',
                                        width: '100%',
                                        margin: 0,
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(46, 125, 50, 0.05)',
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography 
                            variant="subtitle1" 
                            gutterBottom 
                            sx={{ 
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 600,
                                fontSize: '1rem',
                                color: '#2B2B2B',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                '&::before': {
                                    content: '""',
                                    display: 'inline-block',
                                    width: '4px',
                                    height: '16px',
                                    backgroundColor: '#2E7D32',
                                    marginRight: '8px',
                                    borderRadius: '2px',
                                }
                            }}
                        >
                            Sport Group
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                            {['Basketball', 'Soccer', 'Tennis', 'Baseball', 'Running', 'Yoga'].map((sport) => (
                                <FormControlLabel
                                    key={sport}
                                    control={
                                        <Checkbox
                                            checked={filters.sportGroup.includes(sport)}
                                            onChange={() => handleFilterChange('sportGroup', sport)}
                                            sx={{ 
                                                color: '#2B2B2B',
                                                '&.Mui-checked': {
                                                    color: '#2E7D32',
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'rgba(46, 125, 50, 0.08)',
                                                },
                                                padding: '4px',
                                            }}
                                        />
                                    }
                                    label={
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            alignItems: 'center',
                                        }}>
                                            <Typography 
                                                sx={{ 
                                                    color: '#2B2B2B',
                                                    fontSize: '0.9rem',
                                                    fontWeight: filters.sportGroup.includes(sport) ? 600 : 400,
                                                }}
                                            >
                                                {sport}
                                            </Typography>
                                            <Typography 
                                                sx={{ 
                                                    color: '#888',
                                                    fontSize: '0.8rem',
                                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                }}
                                            >
                                                {products.filter((p) => p.name.includes(sport)).length}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ 
                                        mb: 1.5, 
                                        color: '#2B2B2B',
                                        width: '100%',
                                        margin: 0,
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(46, 125, 50, 0.05)',
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography 
                            variant="subtitle1" 
                            gutterBottom 
                            sx={{ 
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 600,
                                fontSize: '1rem',
                                color: '#2B2B2B',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                '&::before': {
                                    content: '""',
                                    display: 'inline-block',
                                    width: '4px',
                                    height: '16px',
                                    backgroundColor: '#2E7D32',
                                    marginRight: '8px',
                                    borderRadius: '2px',
                                }
                            }}
                        >
                            Gender
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                            {['Men', 'Women', 'Unisex'].map((gender) => (
                                <FormControlLabel
                                    key={gender}
                                    control={
                                        <Checkbox
                                            checked={filters.gender.includes(gender)}
                                            onChange={() => handleFilterChange('gender', gender)}
                                            sx={{ 
                                                color: '#2B2B2B',
                                                '&.Mui-checked': {
                                                    color: '#2E7D32',
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'rgba(46, 125, 50, 0.08)',
                                                },
                                                padding: '4px',
                                            }}
                                        />
                                    }
                                    label={
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            alignItems: 'center',
                                        }}>
                                            <Typography 
                                                sx={{ 
                                                    color: '#2B2B2B',
                                                    fontSize: '0.9rem',
                                                    fontWeight: filters.gender.includes(gender) ? 600 : 400,
                                                }}
                                            >
                                                {gender}
                                            </Typography>
                                            <Typography 
                                                sx={{ 
                                                    color: '#888',
                                                    fontSize: '0.8rem',
                                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                }}
                                            >
                                                {products.filter((p) => p.gender === gender).length}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ 
                                        mb: 1.5, 
                                        color: '#2B2B2B',
                                        width: '100%',
                                        margin: 0,
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(46, 125, 50, 0.05)',
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                    
                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                        <Button 
                            variant="outlined" 
                            fullWidth
                            onClick={() => setFilters({ category: [], sportGroup: [], gender: [] })}
                            sx={{ 
                                color: '#2E7D32',
                                borderColor: '#2E7D32',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontSize: '0.8rem',
                                padding: '8px 16px',
                                '&:hover': {
                                    borderColor: '#2E7D32',
                                    backgroundColor: 'rgba(46, 125, 50, 0.05)',
                                },
                            }}
                        >
                            Clear All Filters
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ flex: 1, pl: 3, pr: 2 }}>
                    <Grid container spacing={3}>
                        {filteredProducts.map((product) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                <Card
                                    onClick={() => navigate(`/product/${product.id}`)}
                                    sx={{
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                        borderRadius: '12px',
                                        background: '#ffffff',
                                        position: 'relative',
                                        width: '100%',
                                        flexShrink: 0,
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        overflow: 'hidden',
                                        aspectRatio: '1/1',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                            '& .product-image': {
                                                transform: 'scale(1.05)',
                                            },
                                            '& .product-info': {
                                                backgroundColor: '#f8f8f8',
                                            },
                                        },
                                    }}
                                >
                                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                                        <CardMedia
                                            component="img"
                                            image={product.image}
                                            alt={product.name}
                                            className="product-image"
                                            sx={{
                                                height: '280px',
                                                objectFit: 'cover',
                                                backgroundColor: '#f5f5f5',
                                                transition: 'transform 0.5s ease',
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 12,
                                                left: 12,
                                                backgroundColor: 'rgba(46, 125, 50, 0.9)',
                                                color: 'white',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                zIndex: 1,
                                            }}
                                        >
                                            {product.category}
                                        </Box>
                                    </Box>

                                    <Box
                                        className="product-info"
                                        sx={{
                                            padding: '12px',
                                            transition: 'background-color 0.3s ease',
                                            borderTop: '1px solid rgba(0,0,0,0.05)',
                                            backgroundColor: '#ffffff',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    fontSize: '0.9rem', 
                                                    fontWeight: 600,
                                                    color: '#333',
                                                    fontFamily: "'Montserrat', sans-serif",
                                                    lineHeight: 1.2,
                                                    maxWidth: '70%',
                                                }}
                                            >
                                                {product.name}
                                            </Typography>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    fontSize: '1rem', 
                                                    fontWeight: 700,
                                                    color: '#2E7D32',
                                                    fontFamily: "'Playfair Display', serif",
                                                }}
                                            >
                                                ${product.price}
                                            </Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {[...Array(5)].map((_, index) => (
                                                    <Box 
                                                        key={index}
                                                        sx={{ 
                                                            color: index < Math.floor(product.rating) ? '#FFC107' : '#E0E0E0',
                                                            fontSize: '0.7rem',
                                                            mr: 0.5,
                                                        }}
                                                    >
                                                        ★
                                                    </Box>
                                                ))}
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        fontSize: '0.7rem', 
                                                        color: '#666',
                                                        ml: 0.5,
                                                    }}
                                                >
                                                    ({product.rating})
                                                </Typography>
                                            </Box>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    backgroundColor: '#f5f5f5',
                                                    padding: '1px 8px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.7rem',
                                                    color: '#666'
                                                }}
                                            >
                                                {product.gender}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="Quick View">
                                                    <IconButton 
                                                        size="small"
                                                        sx={{ 
                                                            color: '#666',
                                                            '&:hover': { color: '#1a1a1a' }
                                                        }}
                                                    >
                                                        <VisibilityIcon sx={{ fontSize: '1.1rem' }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Add to Cart">
                                                    <IconButton 
                                                        size="small"
                                                        sx={{ 
                                                            color: '#666',
                                                            '&:hover': { color: '#1a1a1a' }
                                                        }}
                                                    >
                                                        <ShoppingCartIcon sx={{ fontSize: '1.1rem' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </Box>
            </>
    );
};

export default Products;