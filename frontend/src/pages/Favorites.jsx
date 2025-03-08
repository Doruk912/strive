import React, { useState } from 'react';
import { Box, Card, CardMedia, Typography, IconButton, useMediaQuery } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useFavorites } from '../context/FavoritesContext';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
    const { favoriteItems, removeFromFavorites } = useFavorites();
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:600px)');

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                My Favorites
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {favoriteItems.map((product) => (
                    <Card
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                        onMouseEnter={() => setHoveredProduct(product.id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                        sx={{
                            boxShadow: 'none',
                            borderRadius: 0,
                            background: 'transparent',
                            position: 'relative',
                            width: '280px',
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
                        {(hoveredProduct === product.id || isMobile) && (
                            <IconButton
                                onClick={(event) => {
                                    event.stopPropagation();
                                    removeFromFavorites(product.id);
                                }}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    zIndex: 1,
                                    color: '#000',
                                    backgroundColor: '',
                                    padding: '4px',
                                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <FavoriteIcon sx={{ fontSize: '1.2rem' }} />
                            </IconButton>
                        )}
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
                            <Typography
                                variant="body1"
                                sx={{
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                {product.name}
                            </Typography>
                            <Box
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: '0.8rem',
                                        color: 'white',
                                    }}
                                >
                                    ${product.price}
                                </Typography>
                            </Box>
                        </Box>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default Favorites;