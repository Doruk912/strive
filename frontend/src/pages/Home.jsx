import React, { useRef, useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardMedia, Button, IconButton} from '@mui/material';
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
    const [activeDot, setActiveDot] = useState(0);

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

    const handleScrollUpdate = () => {
        if (scrollContainerRef.current) {
            const scrollPosition = scrollContainerRef.current.scrollLeft;
            const width = scrollContainerRef.current.clientWidth;
            const newActiveDot = Math.round(scrollPosition / width);
            setActiveDot(newActiveDot);
        }
    };

    const handleDotClick = (index) => {
        setActiveDot(index);
        if (scrollContainerRef.current) {
            const scrollWidth = scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollTo({
                left: scrollWidth * index,
                behavior: 'smooth'
            });
        }
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
            <Container
                sx={{
                    maxWidth: '90% !important',
                    px: { xs: 1, md: 2 },
                    mx: 'auto',
                }}
            >
                <Box sx={{ my: 4 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            mb: 3,
                            fontSize: { xs: '1.5rem', md: '2rem' },
                            letterSpacing: '0.5px'
                        }}
                    >
                        Popular Categories
                    </Typography>

                    <Box sx={{ position: 'relative' }}>
                        <Box
                            ref={scrollContainerRef}
                            onScroll={handleScrollUpdate}
                            sx={{
                                display: 'flex',
                                overflowX: { xs: 'auto', md: 'hidden' },
                                gap: { xs: 2, md: 2 }, // Reduced gap
                                scrollSnapType: 'x mandatory',
                                '&::-webkit-scrollbar': { display: 'none' },
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                pb: 2
                            }}
                        >
                            {popularCategories.map((category) => (
                                <Box
                                    key={category.id}
                                    sx={{
                                        flex: {
                                            xs: '0 0 42%', // Shows about 2.2 categories on mobile
                                            md: '1', // Equal width on desktop (1/6 since we have 6 categories)
                                        },
                                        scrollSnapAlign: 'start',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Card
                                        sx={{
                                            boxShadow: 'none',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                '& .category-image': {
                                                    transform: 'scale(1.05)',
                                                }
                                            },
                                        }}
                                    >
                                        <Box sx={{
                                            position: 'relative',
                                            paddingTop: '140%', // More vertical aspect ratio
                                            overflow: 'hidden',
                                            backgroundColor: '#f5f5f5'
                                        }}>
                                            <CardMedia
                                                component="img"
                                                image={category.image}
                                                alt={category.name}
                                                className="category-image"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.3s ease',
                                                }}
                                            />
                                        </Box>
                                        <Box
                                            sx={{
                                                py: 1.5, // Reduced padding
                                                px: 1,
                                                backgroundColor: 'white',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    color: '#2B2B2B',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                }}
                                            >
                                                {category.name}
                                            </Typography>
                                        </Box>
                                    </Card>
                                </Box>
                            ))}
                        </Box>

                        {/* Dot Navigation for Mobile */}
                        <Box
                            sx={{
                                display: { xs: 'flex', md: 'none' },
                                justifyContent: 'center',
                                gap: 1,
                                mt: 2
                            }}
                        >
                            {[...Array(Math.ceil(popularCategories.length / 2))].map((_, index) => (
                                <Box
                                    key={index}
                                    onClick={() => handleDotClick(index)}
                                    sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        bgcolor: activeDot === index ? '#000' : '#E0E0E0',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s'
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Container>

            {/* Featured Products Section */}
            <Container
                sx={{
                    maxWidth: '90% !important',
                    px: { xs: 1, md: 2 },
                    mx: 'auto',
                }}
            >
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
