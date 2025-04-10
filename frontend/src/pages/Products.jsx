import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardMedia,
    IconButton,
    Button,
    FormControlLabel,
    Checkbox,
    Tooltip,
    CircularProgress,
    Collapse,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    ShoppingCart as ShoppingCartIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import CartNotification from '../components/CartNotification';
import {Helmet} from "react-helmet";

const Products = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [productRatings, setProductRatings] = useState({});
    const [notification, setNotification] = useState({ open: false, product: null, quantity: 1 });

    // Filter state
    const [filters, setFilters] = useState({
        category: [],
        sportGroup: [],
        gender: []
    });

    // Parse URL parameters for initial filters
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const category = params.get('category');
        const subcategory = params.get('subcategory');
        
        if (category) {
            setFilters(prev => ({
                ...prev,
                category: [category]
            }));
        }
        
        if (subcategory) {
            setFilters(prev => ({
                ...prev,
                sportGroup: [subcategory.replace(/-/g, ' ').toUpperCase()]
            }));
        }
    }, [location]);

    // Fetch categories and products
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsRes, categoriesRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/products'),
                    axios.get('http://localhost:8080/api/categories')
                ]);
                
                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
                
                // Fetch ratings for each product
                const ratingPromises = productsRes.data.map(product => 
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
                
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => {
            const currentFilters = prev[filterType];
            const newFilters = currentFilters.includes(value)
                ? currentFilters.filter(item => item !== value)
                : [...currentFilters, value];
            
            return {
                ...prev,
                [filterType]: newFilters
            };
        });
    };

    const toggleCategoryExpand = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const handleAddToCart = async (e, product) => {
        e.stopPropagation(); // Prevent card click event
        
        // For now, we'll add with a default size since we don't have size selection in the product card
        // In a real implementation, you might want to show a size selection dialog
        const defaultSize = product.stocks && product.stocks.length > 0 ? product.stocks[0].size : null;
        
        if (!defaultSize) {
            alert('This product is out of stock');
            return;
        }
        
        const productWithImage = {
            ...product,
            image: product.images && product.images.length > 0
                ? `data:${product.images[0].imageType};base64,${product.images[0].imageBase64}`
                : '/default-product-image.jpg'
        };
        
        const success = await addToCart(productWithImage, 1, defaultSize);
        
        if (success) {
            setNotification({
                open: true,
                product: productWithImage,
                quantity: 1
            });
            
            setTimeout(() => {
                setNotification(prev => ({ ...prev, open: false }));
            }, 3000);
        }
    };

    // Filter products based on selected filters
    const filteredProducts = products.filter(product => {
        // Category filter
        if (filters.category.length > 0) {
            const productCategory = categories.find(cat => cat.id === product.categoryId);
            if (!productCategory) return false;
            
            // Check if product is in any of the selected categories or their subcategories
            const isInSelectedCategory = filters.category.some(categoryName => {
                const selectedCategory = categories.find(cat => cat.name === categoryName);
                if (!selectedCategory) return false;
                
                // Check if product category is the selected category or a subcategory of it
                return productCategory.id === selectedCategory.id || 
                       isSubcategoryOf(productCategory, selectedCategory);
            });
            
            if (!isInSelectedCategory) return false;
        }
        
        // Sport group filter
        if (filters.sportGroup.length > 0) {
            const productName = product.name.toUpperCase();
            const matchesSportGroup = filters.sportGroup.some(sport => 
                productName.includes(sport)
            );
            if (!matchesSportGroup) return false;
        }
        
        // Gender filter
        if (filters.gender.length > 0) {
            if (!filters.gender.includes(product.gender)) return false;
        }
        
        return true;
    });

    // Helper function to check if a category is a subcategory of another
    const isSubcategoryOf = (category, parentCategory) => {
        if (!category || !parentCategory) return false;
        
        // Check direct parent
        if (category.parentId === parentCategory.id) return true;
        
        // Check if parent is a subcategory of the target parent
        const parent = categories.find(cat => cat.id === category.parentId);
        if (parent) {
            return isSubcategoryOf(parent, parentCategory);
        }
        
        return false;
    };

    // Render category tree recursively
    const renderCategoryTree = (category, level = 0) => {
        const isExpanded = expandedCategories[category.id];
        const hasChildren = category.children && category.children.length > 0;
        
        return (
            <React.Fragment key={category.id}>
                <ListItem
                    button
                    onClick={() => toggleCategoryExpand(category.id)}
                    sx={{
                        pl: level * 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    }}
                >
                    {hasChildren && (
                        <IconButton size="small" sx={{ mr: 1 }}>
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    )}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={filters.category.includes(category.name)}
                                onChange={() => handleFilterChange('category', category.name)}
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
                                        fontWeight: filters.category.includes(category.name) ? 600 : 400,
                                    }}
                                >
                                    {category.name}
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
                                    {products.filter((p) => p.categoryId === category.id).length}
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
                </ListItem>
                
                {hasChildren && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {category.children.map(child => renderCategoryTree(child, level + 1))}
                        </List>
                    </Collapse>
                )}
            </React.Fragment>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
                <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <>
            <Helmet>
                <title>Strive - Products</title>
            </Helmet>
            <CartNotification 
                open={notification.open} 
                product={notification.product} 
                quantity={notification.quantity} 
            />
            <Box sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 700,
                        color: '#2B2B2B',
                        mb: 4,
                    }}
                >
                    Our Products
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ width: { xs: '100%', md: '280px' }, flexShrink: 0 }}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                color: '#2B2B2B',
                                mb: 2,
                            }}
                        >
                            Filters
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
                                Categories
                            </Typography>
                            <List>
                                {categories.map(category => renderCategoryTree(category))}
                            </List>
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
                                                image={product.images && product.images.length > 0
                                                    ? `data:${product.images[0].imageType};base64,${product.images[0].imageBase64}`
                                                    : '/placeholder-image.jpg'}
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
                                                {product.categoryName}
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
                                                                color: index < Math.floor(productRatings[product.id] || product.rating) ? '#FFC107' : '#E0E0E0',
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
                                                        ({productRatings[product.id] || product.rating})
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
                                                    <Tooltip title="Add to Cart">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => handleAddToCart(e, product)}
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