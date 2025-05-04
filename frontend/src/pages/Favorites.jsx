import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Grid,
    Card,
    CardMedia,
    IconButton,
    Container,
    Tooltip,
} from '@mui/material';
import { useFavorites } from '../context/FavoritesContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Helmet } from "react-helmet";
import axios from 'axios';

// Update color constants to match the brand color from Products.jsx
const primaryColor = '#1976d2'; // Primary blue color
const primaryDarkColor = '#1565c0'; // Darker blue color

const Favorites = () => {
    const navigate = useNavigate();
    const { favoriteItems, removeFromFavorites } = useFavorites();
    const [productRatings, setProductRatings] = useState({});
    const [relatedProducts] = useState([]);

    // Fetch ratings for favorite products
    useEffect(() => {
        const fetchRatings = async () => {
            if (favoriteItems.length === 0) return;
            
            try {
                const ratingPromises = favoriteItems.map(product =>
                    axios.get(`http://localhost:8080/api/reviews/product/${product.id}/rating`)
                        .then(res => ({ id: product.id, rating: res.data }))
                        .catch(() => ({ id: product.id, rating: 0 }))
                );

                const ratings = await Promise.all(ratingPromises);
                const ratingsMap = {};
                ratings.forEach(({ id, rating }) => {
                    ratingsMap[id] = rating;
                });
                setProductRatings(ratingsMap);
            } catch (err) {
                console.error('Error fetching ratings:', err);
            }
        };

        fetchRatings();
    }, [favoriteItems]);

    const handleRemoveFavorite = (e, productId) => {
        e.stopPropagation(); // Prevent navigation when clicking the heart icon
        removeFromFavorites(productId);
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    return (
        <>
            <Helmet>
                <title>Strive - My Favorites</title>
            </Helmet>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 700,
                        color: '#2B2B2B',
                        mb: 3,
                        fontSize: { xs: '1.5rem', sm: '1.8rem' },
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: '-10px',
                            left: 0,
                            width: '60px',
                            height: '3px',
                            backgroundColor: primaryColor,
                        }
                    }}
                >
                    My Favorites
                </Typography>

                {favoriteItems.length === 0 ? (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: { xs: 6, sm: 8 }, 
                        backgroundColor: 'rgba(0,0,0,0.02)',
                        borderRadius: '12px'
                    }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            You haven't added any favorites yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Browse our products and add items to your favorites
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={{ xs: 2, md: 3 }}>
                            {favoriteItems.map((product) => (
                                <Grid item xs={6} sm={6} md={4} lg={3} key={product.id}>
                                    <Card
                                        onClick={() => handleProductClick(product.id)}
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            width: '100%',
                                            aspectRatio: { xs: '1/1.6', sm: '1/1.4' },
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                borderColor: 'rgba(0,0,0,0.12)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative', flex: '1 0 auto', height: { xs: '60%', sm: '65%' } }}>
                                            <CardMedia
                                                component="img"
                                                height="100%"
                                                width="100%"
                                                image={product.images && product.images.length > 0
                                                    ? `data:${product.images[0].imageType};base64,${product.images[0].imageBase64}`
                                                    : product.image || '/placeholder-image.jpg'}
                                                alt={product.name}
                                                sx={{
                                                    objectFit: 'cover',
                                                    backgroundColor: '#f5f5f5',
                                                    transition: 'transform 0.3s ease',
                                                    height: '100%',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)'
                                                    }
                                                }}
                                            />
                                            {/* Category Tag */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    left: 12,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    color: '#2B2B2B',
                                                    padding: { xs: '2px 6px', sm: '4px 10px' },
                                                    borderRadius: '16px',
                                                    fontSize: { xs: '0.6rem', sm: '0.7rem' },
                                                    fontWeight: 600,
                                                    letterSpacing: '0.5px',
                                                    textTransform: 'uppercase',
                                                    backdropFilter: 'blur(4px)',
                                                }}
                                            >
                                                {product.categoryName || product.category}
                                            </Box>
                                            
                                            {/* Favorite Remove Button */}
                                            <Tooltip title="Remove from favorites">
                                                <IconButton
                                                    onClick={(e) => handleRemoveFavorite(e, product.id)}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255, 192, 203, 0.9)',
                                                        },
                                                    }}
                                                >
                                                    <FavoriteIcon sx={{ color: '#e91e63' }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>

                                        {/* Product Info */}
                                        <Box sx={{ 
                                            p: { xs: 1.5, sm: 2 }, 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            height: { xs: '40%', sm: '35%' },
                                            justifyContent: 'space-between'
                                        }}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                                    fontWeight: 600,
                                                    mb: 0.5,
                                                    color: '#2B2B2B',
                                                    fontFamily: "'Montserrat', sans-serif",
                                                    lineHeight: 1.3,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {product.name}
                                            </Typography>

                                            {/* Rating */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.4, sm: 0.8 } }}>
                                                {[...Array(5)].map((_, index) => {
                                                    const rating = productRatings[product.id] || product.rating || 0;
                                                    const isHalfStar = index < rating && index >= Math.floor(rating);
                                                    
                                                    return (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                position: 'relative',
                                                                display: 'inline-block',
                                                                color: '#E0E0E0',
                                                                fontSize: { xs: '0.8rem', sm: '1rem' },
                                                                mr: 0.1,
                                                            }}
                                                        >
                                                            {/* Background star (always shown) */}
                                                            <span>★</span>
                                                            
                                                            {/* Foreground star (full or half) */}
                                                            {(index < Math.floor(rating) || isHalfStar) && (
                                                                <Box
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: 0,
                                                                        color: '#FFC107',
                                                                        overflow: 'hidden',
                                                                        width: isHalfStar ? '50%' : '100%',
                                                                    }}
                                                                >
                                                                    ★
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    );
                                                })}
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        ml: 0.6,
                                                        color: '#666',
                                                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    ({((productRatings[product.id] || product.rating || 0)).toFixed(1)})
                                                </Typography>
                                            </Box>

                                            {/* Price */}
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: primaryColor,
                                                    fontWeight: 700,
                                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                                    fontFamily: "'Playfair Display', serif",
                                                    mt: { xs: 'auto', sm: 'auto' },
                                                }}
                                            >
                                                ${product.price}
                                            </Typography>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {relatedProducts.length > 0 && (
                            <Box sx={{ mt: 8 }}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontWeight: 700,
                                        color: '#2B2B2B',
                                        mb: 3,
                                        fontSize: { xs: '1.5rem', sm: '1.8rem' },
                                        position: 'relative',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: '-10px',
                                            left: 0,
                                            width: '60px',
                                            height: '3px',
                                            backgroundColor: primaryColor,
                                        }
                                    }}
                                >
                                    You May Also Like
                                </Typography>
                                <Grid container spacing={{ xs: 2, md: 3 }}>
                                    {relatedProducts.map((product) => (
                                        <Grid item xs={6} sm={6} md={4} lg={3} key={product.id}>
                                            <Card
                                                onClick={() => handleProductClick(product.id)}
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    borderRadius: '12px',
                                                    border: '1px solid rgba(0,0,0,0.08)',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                    width: '100%',
                                                    aspectRatio: { xs: '1/1.6', sm: '1/1.4' },
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                        borderColor: 'rgba(0,0,0,0.12)'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ position: 'relative', flex: '1 0 auto', height: { xs: '60%', sm: '65%' } }}>
                                                    <CardMedia
                                                        component="img"
                                                        height="100%"
                                                        width="100%"
                                                        image={product.images && product.images.length > 0
                                                            ? `data:${product.images[0].imageType};base64,${product.images[0].imageBase64}`
                                                            : product.image || '/placeholder-image.jpg'}
                                                        alt={product.name}
                                                        sx={{
                                                            objectFit: 'cover',
                                                            backgroundColor: '#f5f5f5',
                                                            transition: 'transform 0.3s ease',
                                                            height: '100%',
                                                            '&:hover': {
                                                                transform: 'scale(1.05)'
                                                            }
                                                        }}
                                                    />
                                                    {/* Category Tag */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 12,
                                                            left: 12,
                                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                            color: '#2B2B2B',
                                                            padding: { xs: '2px 6px', sm: '4px 10px' },
                                                            borderRadius: '16px',
                                                            fontSize: { xs: '0.6rem', sm: '0.7rem' },
                                                            fontWeight: 600,
                                                            letterSpacing: '0.5px',
                                                            textTransform: 'uppercase',
                                                            backdropFilter: 'blur(4px)',
                                                        }}
                                                    >
                                                        {product.categoryName || product.category}
                                                    </Box>
                                                </Box>

                                                {/* Product Info */}
                                                <Box sx={{ 
                                                    p: { xs: 1.5, sm: 2 }, 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    height: { xs: '40%', sm: '35%' },
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                                            fontWeight: 600,
                                                            mb: 0.5,
                                                            color: '#2B2B2B',
                                                            fontFamily: "'Montserrat', sans-serif",
                                                            lineHeight: 1.3,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                        }}
                                                    >
                                                        {product.name}
                                                    </Typography>

                                                    {/* Rating */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.4, sm: 0.8 } }}>
                                                        {[...Array(5)].map((_, index) => {
                                                            const rating = productRatings[product.id] || product.rating || 0;
                                                            const isHalfStar = index < rating && index >= Math.floor(rating);
                                                            
                                                            return (
                                                                <Box
                                                                    key={index}
                                                                    sx={{
                                                                        position: 'relative',
                                                                        display: 'inline-block',
                                                                        color: '#E0E0E0',
                                                                        fontSize: { xs: '0.8rem', sm: '1rem' },
                                                                        mr: 0.1,
                                                                    }}
                                                                >
                                                                    {/* Background star (always shown) */}
                                                                    <span>★</span>
                                                                    
                                                                    {/* Foreground star (full or half) */}
                                                                    {(index < Math.floor(rating) || isHalfStar) && (
                                                                        <Box
                                                                            sx={{
                                                                                position: 'absolute',
                                                                                top: 0,
                                                                                left: 0,
                                                                                color: '#FFC107',
                                                                                overflow: 'hidden',
                                                                                width: isHalfStar ? '50%' : '100%',
                                                                            }}
                                                                        >
                                                                            ★
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            );
                                                        })}
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                ml: 0.6,
                                                                color: '#666',
                                                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            ({((productRatings[product.id] || product.rating || 0)).toFixed(1)})
                                                        </Typography>
                                                    </Box>

                                                    {/* Price */}
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            color: primaryColor,
                                                            fontWeight: 700,
                                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                                            fontFamily: "'Playfair Display', serif",
                                                            mt: { xs: 'auto', sm: 'auto' },
                                                        }}
                                                    >
                                                        ${product.price}
                                                    </Typography>
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </>
    );
};

export default Favorites;