import React, { useRef, useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardMedia, Button, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import PromotionalBanner from "../components/PromotionalBanner";
import { useFavorites } from '../context/FavoritesContext';
import {Helmet} from "react-helmet";
import { featuredCategoryService } from '../services/featuredCategoryService';
import axios from 'axios';

const Home = () => {
    const navigate = useNavigate(); // Initialize useNavigate
    const scrollContainerRef = useRef(null);
    const { favoriteItems, addToFavorites, removeFromFavorites } = useFavorites();
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [activeDot, setActiveDot] = useState(0);
    const [popularCategories, setPopularCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [featuredProducts, setFeaturedProducts] = useState([]); // Add state for featured products

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/products/featured');
            setFeaturedProducts(response.data);
        } catch (error) {
            console.error('Error fetching featured products:', error);
            setError('Failed to load featured products');
        }
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            
            // Fetch both in parallel
            const [featuredResponse, allCategoriesResponse] = await Promise.all([
                featuredCategoryService.getAllFeaturedCategories(),
                axios.get('http://localhost:8080/api/categories')
            ]);

            const featuredCategories = featuredResponse;
            const allCategories = allCategoriesResponse.data;
            
            // Build a map of categories for quick lookup
            const categoryMap = new Map(allCategories.map(cat => [cat.id, cat]));
            
            // Enhance featured categories with complete parent information
            const enhancedCategories = featuredCategories.map(featCat => {
                const fullCategoryInfo = categoryMap.get(featCat.categoryId);
                
                // Get complete parent chain
                let parentChain = [];
                let currentCat = fullCategoryInfo;
                while (currentCat && currentCat.parent) {
                    const parentCat = categoryMap.get(currentCat.parent);
                    if (parentCat) {
                        parentChain.unshift(parentCat);
                        currentCat = parentCat;
                    } else {
                        break;
                    }
                }
                
                return {
                    ...featCat,
                    parentId: fullCategoryInfo?.parent || null,
                    parentChain: parentChain.map(p => p.id), // Store full parent chain
                    fullCategoryInfo // Store complete category info
                };
            });
            
            console.log('Enhanced categories with full parent chain:', enhancedCategories);
            setPopularCategories(enhancedCategories);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load categories');
            setLoading(false);
        }
    };

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

    const toggleFavorite = (product) => {
        const isAlreadyFavorite = favoriteItems.some(item => item.id === product.id);

        if (isAlreadyFavorite) {
            removeFromFavorites(product.id);
        } else {
            addToFavorites(product);
        }
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

    // Function to handle category click
    const handleCategoryClick = (categoryId) => {
        const selectedCategory = popularCategories.find(cat => cat.categoryId === categoryId);
        
        if (selectedCategory) {
            let queryParams = new URLSearchParams();
            
            // Add the selected category
            queryParams.set('category', categoryId);
            queryParams.set('expandFilters', 'true');
            
            // If this category has a parent, set it for better context
            if (selectedCategory.fullCategoryInfo && selectedCategory.fullCategoryInfo.parent) {
                queryParams.set('parentCategory', selectedCategory.fullCategoryInfo.parent);
            }
            
            // If this category has a parent chain, add it to expand the full tree
            if (selectedCategory.parentChain && selectedCategory.parentChain.length > 0) {
                queryParams.set('parentChain', selectedCategory.parentChain.join(','));
            }
            
            // Use push instead of navigate to force a full navigation event
            // This ensures the Products component fully remounts with the new parameters
            window.location.href = `${window.location.origin}/products?${queryParams.toString()}`;
        } else {
            // Fallback navigation
            window.location.href = `${window.location.origin}/products?category=${categoryId}&expandFilters=true`;
        }
    };

    return (
        <>
            <Helmet>
                <title>Strive - Home</title>
            </Helmet>
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
                        Push Your Limits, Find Your Stride
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
                        variant="h4"
                        sx={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 600,
                            fontSize: { xs: '1.4rem', sm: '1.5rem' },
                            color: '#2B2B2B',
                            textAlign: 'left',
                            marginBottom: '1.5rem',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            '&::before': {
                                content: '""',
                                display: 'inline-block',
                                width: '4px',
                                height: '24px',
                                backgroundColor: '#1976d2',
                                marginRight: '12px',
                                borderRadius: '2px',
                            }
                        }}
                    >
                        POPULAR CATEGORIES
                    </Typography>

                    <Box sx={{ position: 'relative' }}>
                        {loading ? (
                            <Typography>Loading categories...</Typography>
                        ) : error ? (
                            <Typography color="error">{error}</Typography>
                        ) : (
                            <Box
                                ref={scrollContainerRef}
                                onScroll={handleScrollUpdate}
                                sx={{
                                    display: 'flex',
                                    overflowX: { xs: 'auto', md: 'hidden' },
                                    gap: { xs: 2, md: 2 },
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
                                                xs: '0 0 42%',
                                                md: '1',
                                            },
                                            scrollSnapAlign: 'start',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => handleCategoryClick(category.categoryId)}
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
                                                paddingTop: '140%',
                                                overflow: 'hidden',
                                                backgroundColor: '#f5f5f5'
                                            }}>
                                                <CardMedia
                                                    component="img"
                                                    image={category.imageBase64 ? `data:${category.imageType};base64,${category.imageBase64}` : '/placeholder-image.jpg'}
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
                                                    py: 1.5,
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
                        )}

                        {/* Dot Navigation for Mobile */}
                        {!loading && !error && (
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
                        )}
                    </Box>
                </Box>
            </Container>

            <PromotionalBanner />

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
                        variant="h4"
                        sx={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 600,
                            fontSize: { xs: '1.4rem', sm: '1.5rem' },
                            color: '#2B2B2B',
                            textAlign: 'left',
                            marginBottom: '1.5rem',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            '&::before': {
                                content: '""',
                                display: 'inline-block',
                                width: '4px',
                                height: '24px',
                                backgroundColor: '#1976d2',
                                marginRight: '12px',
                                borderRadius: '2px',
                            }
                        }}
                    >
                        FEATURED PRODUCTS
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
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        width: '280px',
                                        flexShrink: 0,
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
                                            image={product.images && product.images.length > 0 
                                                ? `data:${product.images[0].imageType};base64,${product.images[0].imageBase64}`
                                                : '/placeholder-image.jpg'}
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
                                                padding: '4px 10px',
                                                borderRadius: '16px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                letterSpacing: '0.5px',
                                                textTransform: 'uppercase',
                                                backdropFilter: 'blur(4px)',
                                            }}
                                        >
                                            {product.categoryName}
                                        </Box>
                                        {/* Favorite Button */}
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(product);
                                            }}
                                            sx={{
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                backdropFilter: 'blur(4px)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 1)'
                                                }
                                            }}
                                        >
                                            {favoriteItems.some(item => item.id === product.id) ? (
                                                <FavoriteIcon sx={{ color: '#ff4081' }} />
                                            ) : (
                                                <FavoriteBorderIcon />
                                            )}
                                        </IconButton>
                                    </Box>

                                    {/* Product Info */}
                                    <Box sx={{
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '35%',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontSize: '0.9rem',
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
                                            {[...Array(5)].map((_, index) => {
                                                const rating = product.averageRating || 0;
                                                const isHalfStar = index < rating && index >= Math.floor(rating);

                                                return (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            position: 'relative',
                                                            display: 'inline-block',
                                                            color: '#E0E0E0',
                                                            fontSize: '1rem',
                                                            mr: 0.1,
                                                        }}
                                                    >
                                                        {/* Background star */}
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
                                                    fontSize: '0.8rem',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                ({(product.averageRating || 0).toFixed(1)})
                                            </Typography>
                                        </Box>

                                        {/* Price */}
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: '#1976d2',
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                fontFamily: "'Playfair Display', serif",
                                                mt: 'auto',
                                            }}
                                        >
                                            ${Number(product.price).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
        </>
    );
};

export default Home;