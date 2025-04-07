import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Card,
    CardMedia,
    IconButton,
    Grid,
    Tooltip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import { useFavorites } from '../context/FavoritesContext';
import {Helmet} from "react-helmet";

const Favorites = () => {
    const navigate = useNavigate();
    const { favoriteItems, removeFromFavorites } = useFavorites();
    const [hoveredProduct, setHoveredProduct] = useState(null);

    const handleRemoveFavorite = (productId) => {
        removeFromFavorites(productId);
    };

    return (
        <>
            <Helmet>
                <title>Strive - My Favorites</title>
            </Helmet>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 700,
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                        color: '#1a1a1a',
                        textAlign: 'left',
                        marginBottom: '1.5rem',
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: '-10px',
                            left: 0,
                            width: '60px',
                            height: '3px',
                            backgroundColor: '#2E7D32',
                        }
                    }}
                >
                    My Favorites
                </Typography>

                {favoriteItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            You haven't added any favorites yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Browse our products and add your favorites
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {favoriteItems.map((product) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        aspectRatio: '1/1.4',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                            borderColor: 'rgba(0,0,0,0.12)'
                                        }
                                    }}
                                >
                                    <Box sx={{ position: 'relative', flex: '1 0 auto', height: '65%' }}>
                                        <CardMedia
                                            component="img"
                                            height="100%"
                                            width="100%"
                                            image={product.image}
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
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 12,
                                                left: 12,
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            {product.category}
                                        </Box>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFavorite(product.id);
                                            }}
                                            sx={{
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                backgroundColor: 'rgba(255,255,255,0.9)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255,255,255,1)'
                                                }
                                            }}
                                        >
                                            <FavoriteIcon sx={{ color: '#ff4081' }} />
                                        </IconButton>
                                    </Box>
                                    <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#ffffff' }}>
                                        <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                                mb: 0.5,
                                                fontFamily: 'Montserrat',
                                                fontWeight: 500,
                                                fontSize: '0.9rem',
                                                color: '#1a1a1a'
                                            }}
                                        >
                                            {product.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    fontFamily: 'Playfair Display',
                                                    fontWeight: 600,
                                                    fontSize: '1rem',
                                                    color: '#1a1a1a'
                                                }}
                                            >
                                                ${product.price}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <StarIcon sx={{ fontSize: '0.7rem', color: '#ffd700' }} />
                                                <Typography variant="body2" sx={{ fontSize: '0.7rem', color: '#666' }}>
                                                    {product.rating}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                                <Tooltip title="Hızlı Bakış">
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
                                                <Tooltip title="Sepete Ekle">
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
                )}
            </Container>
        </>
    );
};

export default Favorites;