import React, { useRef, useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardMedia, Button, IconButton, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { featuredProducts, popularCategories } from '../mockData/Products';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Home = () => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);
    const [favorites, setFavorites] = useState({});
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScrollPosition = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', checkScrollPosition);
            checkScrollPosition();
            return () => scrollContainer.removeEventListener('scroll', checkScrollPosition);
        }
    }, []);

    const handleScroll = (scrollOffset) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: scrollOffset,
                behavior: 'smooth',
            });
        }
    };

    const toggleFavorite = (id) => {
        setFavorites((prevFavorites) => ({
            ...prevFavorites,
            [id]: !prevFavorites[id],
        }));
    };

    return (
        <Box sx={{ width: '100%', marginTop: { xs: '-38px', md: '-30px' }}}>
            {/* Hero Section with Full-Width Video and Text Overlay */}
            <Box
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    mb: 4,
                    height: {
                        xs: '500px', // Height for mobile
                        sm: '600px', // Height for tablet
                        md: '700px'  // Height for desktop
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        }
                    }}
                >
                    <CardMedia
                        component="video"
                        src="/video.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline // Important for iOS
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            minWidth: '100%',
                            minHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            transform: 'translate(-50%, -50%)',
                            objectFit: 'cover',
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        position: 'relative', // Changed to relative
                        zIndex: 1, // Ensure text appears above video
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: {
                            xs: 'center', // Center align on mobile
                            md: 'flex-start' // Left align on desktop
                        },
                        color: '#fff',
                        p: {
                            xs: 2, // Less padding on mobile
                            sm: 4, // More padding on larger screens
                        },
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            mb: 2,
                            textAlign: {
                                xs: 'center', // Center text on mobile
                                md: 'left' // Left align on desktop
                            },
                            fontSize: {
                                xs: '1.8rem', // Smaller font on mobile
                                sm: '2.125rem' // Regular h4 size on larger screens
                            }
                        }}
                    >
                        Discover Our Latest Collection
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 2,
                            textAlign: {
                                xs: 'center', // Center text on mobile
                                md: 'left' // Left align on desktop
                            },
                            fontSize: {
                                xs: '1.1rem', // Smaller font on mobile
                                sm: '1.25rem' // Regular h6 size on larger screens
                            }
                        }}
                    >
                        Premium sports accessories for every athlete
                    </Typography>
                    <Button
                        onClick={() => navigate('/products')}
                        sx={{
                            mt: 2,
                            color: '#ffffff',
                            backgroundColor: 'transparent',
                            border: '1px solid #ffffff',
                            borderRadius: '2px',
                            padding: '8px 20px',
                            fontSize: {
                                xs: '12px', // Smaller font on mobile
                                sm: '14px'  // Regular size on larger screens
                            },
                            fontWeight: 400,
                            textTransform: 'none',
                            letterSpacing: '0.5px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid #ffffff',
                            },
                        }}
                    >
                        Browse Products
                    </Button>
                </Box>
            </Box>

            {/* Popular Categories Section */}
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        Popular Categories
                    </Typography>
                    <Grid container spacing={2}> {/* Use Grid container for consistent layout */}
                        {popularCategories.map((category) => (
                            <Grid item xs={12} sm={2.4} key={category.id}> {/* 100% / 5 = 20% width per category */}
                                <Card
                                    sx={{
                                        boxShadow: 'none',
                                        borderRadius: 0, // Remove border radius for square corners
                                        width: '100%', // Full width of the grid item
                                        flexShrink: 0,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        '&:hover': {
                                            transform: 'scale(1.05)', // Slight scale on hover
                                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Add shadow on hover
                                        },
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="120"
                                        image={category.image}
                                        alt={category.name}
                                        sx={{
                                            objectFit: 'cover',
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            padding: '8px',
                                            backgroundColor: '#868686',
                                            color: 'white',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Typography>{category.name}</Typography>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>

            {/* Featured Products Section */}
            <Container maxWidth="lg">
                <Box sx={{ my: 4, position: 'relative' }}>
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            mb: 3,
                        }}
                    >
                        Featured Products
                    </Typography>
                    <Box sx={{ position: 'relative' }}>
                        {/* Left arrow button */}
                        <IconButton
                            onClick={() => handleScroll(-300)}
                            sx={{
                                position: 'absolute',
                                left: -20,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 2,
                                backgroundColor: 'white',
                                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                                display: showLeftArrow ? 'flex' : 'none',
                            }}
                        >
                            <ArrowBackIosIcon sx={{ fontSize: '0.8rem', ml: 0.5 }} />
                        </IconButton>

                        {/* Right arrow button */}
                        <IconButton
                            onClick={() => handleScroll(300)}
                            sx={{
                                position: 'absolute',
                                right: -20,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 2,
                                backgroundColor: 'white',
                                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                                display: showRightArrow ? 'flex' : 'none',
                            }}
                        >
                            <ArrowForwardIosIcon sx={{ fontSize: '0.8rem' }} />
                        </IconButton>

                        {/* Scrollable container for products */}
                        <Box
                            ref={scrollContainerRef}
                            sx={{
                                display: 'flex',
                                overflowX: 'auto',
                                gap: 2,
                                scrollBehavior: 'smooth',
                                padding: '16px 0',
                                '&::-webkit-scrollbar': {
                                    height: '6px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: '#ccc',
                                    borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: '#f1f1f1',
                                },
                            }}
                        >
                            {featuredProducts.map((product) => (
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
                                        width: '280px', // Increased width to fit only 4 boxes in a row
                                        flexShrink: 0,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        '&:hover': {
                                            transform: 'scale(1.05)', // Slight scale on hover
                                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Add shadow on hover
                                        },
                                    }}
                                >
                                    {/* Favorite button */}
                                    {hoveredProduct === product.id && (
                                        <IconButton
                                            onClick={() => toggleFavorite(product.id)}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                zIndex: 1,
                                                color: favorites[product.id] ? '#000000' : '#000',
                                                backgroundColor: '',
                                                padding: '4px',
                                                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                                            }}
                                        >
                                            {favorites[product.id] ? (
                                                <FavoriteIcon sx={{ fontSize: '1.2rem' }} />
                                            ) : (
                                                <FavoriteBorderIcon sx={{ fontSize: '1.2rem' }} />
                                            )}
                                        </IconButton>
                                    )}

                                    {/* Product image */}
                                    <CardMedia
                                        component="img"
                                        image={product.image}
                                        alt={product.name}
                                        sx={{
                                            height: '240px', // Increased height to match the new width
                                            objectFit: 'cover',
                                            backgroundColor: '#f5f5f5',
                                            marginBottom: 1,
                                        }}
                                    />

                                    {/* Product info with gray background */}
                                    <Box
                                        sx={{
                                            backgroundColor: '#868686',
                                            color: 'white',
                                            padding: '8px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            {product.name}
                                        </Typography>
                                    </Box>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Home;
