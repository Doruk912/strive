import React, { useState, useEffect } from 'react';
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
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import { useFavorites } from '../context/FavoritesContext';
import {Helmet} from "react-helmet";
import { products } from '../mockData/Products';

const Favorites = () => {
    const navigate = useNavigate();
    const { favoriteItems, removeFromFavorites } = useFavorites();
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        if (favoriteItems.length > 0) {
            const related = getRelatedProducts(favoriteItems[0]);
            setRelatedProducts(related);
        }
    }, [favoriteItems]);

    const getRelatedProducts = (currentProduct) => {
        return products
            .filter(p => 
                p.id !== currentProduct.id && 
                (p.category === currentProduct.category || 
                 p.gender === currentProduct.gender)
            )
            .slice(0, 4);
    };

    const handleRemoveFavorite = (productId) => {
        removeFromFavorites(productId);
    };

    const addToCart = (productId) => {
        // Logic to add the product to the cart
        console.log(`Product ${productId} added to cart`);
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`); // Ürün detay sayfasına yönlendirme
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
                        fontWeight: 500,
                        fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
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
                            backgroundColor: '#4CAF50',
                        }
                    }}
                >
                    My Favorites
                </Typography>

                {favoriteItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            You haven't added any favorites yet.
                        </Typography>
                    </Box>
                ) : (
                    <>
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
                                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                            },
                                        }}
                                        onClick={() => handleProductClick(product.id)} // Tıklama olayı
                                        style={{ cursor: 'pointer' }} // Tıklanabilir olduğunu göstermek için
                                    >
                                        <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                                            <CardMedia
                                                component="img"
                                                image={product.image}
                                                alt={product.name}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)',
                                                    },
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    left: 8,
                                                    backgroundColor: 'rgba(76, 175, 80, 0.9)',
                                                    color: 'white',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {product.category}
                                            </Box>
                                            <IconButton
                                                onClick={() => handleRemoveFavorite(product.id)}
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
                                        </Box>
                                        <Box sx={{ p: 2, flexGrow: 1 }}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontFamily: "'Montserrat', sans-serif",
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    mb: 1,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {product.name}
                                            </Typography>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontFamily: "'Playfair Display', serif",
                                                    color: '#4CAF50',
                                                    fontWeight: 600,
                                                    mb: 1,
                                                }}
                                            >
                                                ${product.price}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <StarIcon sx={{ color: '#FFD700', fontSize: '1rem', mr: 0.5 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {product.rating}
                                                </Typography>
                                            </Box>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    backgroundColor: '#f5f5f5',
                                                    padding: '1px 8px',
                                                    borderRadius: '20px',
                                                    color: '#666',
                                                    fontSize: '0.7rem',
                                                }}
                                            >
                                                {product.gender}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                                <Tooltip title="Add to Cart">
                                                    <IconButton
                                                        onClick={() => addToCart(product.id)}
                                                        sx={{
                                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(76, 175, 80, 0.9)',
                                                            },
                                                        }}
                                                    >
                                                        <ShoppingCartIcon sx={{ color: '#4CAF50' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {relatedProducts.length > 0 && (
                            <Box sx={{ mt: 8 }}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontWeight: 500,
                                        fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
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
                                            backgroundColor: '#4CAF50',
                                        }
                                    }}
                                >
                                    You May Also Like
                                </Typography>
                                <Grid container spacing={3}>
                                    {relatedProducts.map((product) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                            <Card
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    borderRadius: '12px',
                                                    border: '1px solid rgba(0,0,0,0.08)',
                                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                    },
                                                }}
                                            >
                                                <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                                                    <CardMedia
                                                        component="img"
                                                        image={product.image}
                                                        alt={product.name}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            transition: 'transform 0.3s ease',
                                                            '&:hover': {
                                                                transform: 'scale(1.05)',
                                                            },
                                                        }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            left: 8,
                                                            backgroundColor: 'rgba(76, 175, 80, 0.9)',
                                                            color: 'white',
                                                            padding: '4px 10px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {product.category}
                                                    </Box>
                                                </Box>
                                                <Box sx={{ p: 2, flexGrow: 1 }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontFamily: "'Montserrat', sans-serif",
                                                            fontSize: '1rem',
                                                            fontWeight: 600,
                                                            mb: 1,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                        }}
                                                    >
                                                        {product.name}
                                                    </Typography>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontFamily: "'Playfair Display', serif",
                                                            color: '#4CAF50',
                                                            fontWeight: 600,
                                                            mb: 1,
                                                        }}
                                                    >
                                                        ${product.price}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <StarIcon sx={{ color: '#FFD700', fontSize: '1rem', mr: 0.5 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {product.rating}
                                                        </Typography>
                                                    </Box>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            backgroundColor: '#f5f5f5',
                                                            padding: '1px 8px',
                                                            borderRadius: '20px',
                                                            color: '#666',
                                                            fontSize: '0.7rem',
                                                        }}
                                                    >
                                                        {product.gender}
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