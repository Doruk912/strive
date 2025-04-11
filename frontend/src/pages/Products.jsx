import React, { useState, useEffect, useMemo } from 'react';
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

// Create a separate component for category tree items
const CategoryTreeItem = ({ category, level, filters, handleFilterChange, countProductsInSubcategories }) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = category.children && category.children.length > 0;
    const count = countProductsInSubcategories(category);

    return (
        <div>
            <ListItem
                sx={{
                    pl: level * 2,
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                }}
            >
                {hasChildren && (
                    <IconButton
                        size="small"
                        onClick={() => setExpanded(!expanded)}
                        sx={{ mr: 1 }}
                    >
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                )}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={filters.category.includes(category.id)}
                            onChange={(e) => handleFilterChange('category', category.id)}
                            size="small"
                        />
                    }
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2">{category.name}</Typography>
                            <Typography
                                variant="caption"
                                sx={{ ml: 1, color: 'text.secondary' }}
                            >
                                ({count})
                            </Typography>
                        </Box>
                    }
                />
            </ListItem>
            {hasChildren && (
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {category.children.map((child) => (
                            <CategoryTreeItem 
                                key={child.id}
                                category={child} 
                                level={level + 1} 
                                filters={filters}
                                handleFilterChange={handleFilterChange}
                                countProductsInSubcategories={countProductsInSubcategories}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </div>
    );
};

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
    const [hoveredProduct, setHoveredProduct] = useState(null);

    // Filter state
    const [filters, setFilters] = useState({
        category: []
    });

    // Parse URL parameters for initial filters
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category');
        
        if (categoryParam) {
            const category = categories.find(cat => cat.name === categoryParam);
            if (category) {
                setFilters(prev => ({
                    ...prev,
                    category: [category.id]
                }));
            }
        }
    }, [location, categories]);

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

    // Get all subcategory IDs for a given category
    const getAllSubcategoryIds = (category) => {
        const ids = [category.id];
        if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
                ids.push(...getAllSubcategoryIds(child));
            });
        }
        return ids;
    };

    // Filter products based on selected filters
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Category filter
            if (filters.category.length > 0) {
                const matchesCategory = filters.category.some(categoryId => {
                    const selectedCategory = categories.find(cat => cat.id === categoryId);
                    if (!selectedCategory) return false;

                    // Get all subcategory IDs for the selected category
                    const validCategoryIds = getAllSubcategoryIds(selectedCategory);
                    return validCategoryIds.includes(product.categoryId);
                });
                if (!matchesCategory) return false;
            }

            return true;
        });
    }, [products, filters, categories]);

    // Count products in a category and its subcategories
    const countProductsInCategory = (category) => {
        const categoryIds = getAllSubcategoryIds(category);
        return products.filter(product => categoryIds.includes(product.categoryId)).length;
    };

    // Calculate filter counts
    const getFilterCounts = useMemo(() => {
        return {
            categoryCounts: categories.reduce((counts, category) => {
                counts[category.name] = countProductsInCategory(category);
                return counts;
            }, {})
        };
    }, [products, categories]);

    // Update the renderCategoryTree function to use the new component
    const renderCategoryTree = (category, level = 0) => {
        return (
            <CategoryTreeItem 
                key={category.id}
                category={category} 
                level={level} 
                filters={filters}
                handleFilterChange={handleFilterChange}
                countProductsInSubcategories={countProductsInCategory}
            />
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
                    STRIVE | Products
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
                                {categories
                                    .filter(category => !category.parent) // Only show root categories initially
                                    .map(category => renderCategoryTree(category))}
                            </List>
                        </Box>

                        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => setFilters({ category: [] })}
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

                    <Box sx={{ flex: 1 }}>
                        <Grid container spacing={3}>
                            {filteredProducts.map((product) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                    <Card
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        onMouseEnter={() => setHoveredProduct(product.id)}
                                        onMouseLeave={() => setHoveredProduct(null)}
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            width: '100%',
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
                                        </Box>

                                        {/* Product Info */}
                                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '35%' }}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600,
                                                    mb: 0.5,
                                                    color: '#2B2B2B',
                                                    fontFamily: "'Montserrat', sans-serif",
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                {product.name}
                                            </Typography>

                                            {/* Rating */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                {[...Array(5)].map((_, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            color: index < Math.floor(productRatings[product.id] || 0) ? '#FFC107' : '#E0E0E0',
                                                            fontSize: '0.8rem',
                                                        }}
                                                    >
                                                        ★
                                                    </Box>
                                                ))}
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        ml: 0.5,
                                                        color: '#666',
                                                        fontSize: '0.7rem',
                                                    }}
                                                >
                                                    ({productRatings[product.id] || 0})
                                                </Typography>
                                            </Box>

                                            {/* Price */}
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    mt: 'auto',
                                                    color: '#2E7D32',
                                                    fontWeight: 700,
                                                    fontSize: '1.1rem',
                                                    fontFamily: "'Playfair Display', serif",
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
                </Box>
            </Box>
        </>
    );
};

export default Products;