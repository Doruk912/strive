import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Typography,
    Box,
    Grid,
    Card,
    CardMedia,
    IconButton,
    Button,
    FormControlLabel,
    Checkbox,
    CircularProgress,
    Collapse,
    List,
    ListItem,
    TextField,
    Slider,
} from '@mui/material';
import {
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
        category: [],
        name: '',
        priceRange: [0, 1000],
        minRating: 0,
        sizes: []
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
        if (filterType !== 'category') {
            setFilters(prev => ({
                ...prev,
                [filterType]: prev[filterType].includes(value)
                    ? prev[filterType].filter(item => item !== value)
                    : [...prev[filterType], value]
            }));
            return;
        }

        setFilters(prev => {
            const category = findCategoryById(value);
            if (!category) return prev;

            const currentFilters = prev.category;

            // If the category is already selected, deselect it
            if (currentFilters.includes(value)) {
                return {
                    ...prev,
                    category: currentFilters.filter(id => id !== value)
                };
            }

            // If the category is not selected, select it and deselect any descendants/ancestors as needed
            const newFilters = [...currentFilters, value];

            // Remove any descendants that are already selected
            const categoryWithDescendants = getAllSubcategoryIds(category);
            const filtered = newFilters.filter(id => !categoryWithDescendants.includes(id) || id === value);

            // Remove any ancestors that are already selected
            let current = category;
            while (current && current.parent) {
                const parent = findCategoryById(current.parent);
                if (parent && filtered.includes(parent.id)) {
                    filtered.splice(filtered.indexOf(parent.id), 1);
                }
                current = parent;
            }

            return {
                ...prev,
                category: filtered
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

    // Find a category by ID in the entire category tree (recursive)
    const findCategoryById = useCallback((categoryId) => {
        // Helper function to search through category tree
        const searchInCategories = (categories, id) => {
            for (const category of categories) {
                if (category.id === id) {
                    return category;
                }

                if (category.children && category.children.length > 0) {
                    const found = searchInCategories(category.children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        return searchInCategories(categories, categoryId);
    }, [categories]);

    // Get all subcategory IDs for a given category (including itself)
    const getAllSubcategoryIds = useCallback((category) => {
        const ids = [category.id];
        if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
                ids.push(...getAllSubcategoryIds(child));
            });
        }
        return ids;
    }, []);

    // Count products in a category and its subcategories
    const countProductsInSubcategories = useCallback((category) => {
        const categoryIds = getAllSubcategoryIds(category);
        return products.filter(product => categoryIds.includes(product.categoryId)).length;
    }, [products, getAllSubcategoryIds]);

    const filteredProducts = useMemo(() => {
        let filtered = products;
        
        // Category filtering (existing logic)
        if (filters.category.length > 0) {
            // Get all selected categories
            const selectedCategories = filters.category
                .map(id => findCategoryById(id))
                .filter(Boolean);

            // If no valid categories found, return empty array
            if (selectedCategories.length === 0) {
                return [];
            }

            // Create a Set to store all category IDs to include
            const includedCategoryIds = new Set();

            // Function to check if a category is a parent of another
            const isParentOf = (parent, child) => {
                let current = child;
                while (current && current.parent) {
                    if (current.parent === parent.id) return true;
                    current = findCategoryById(current.parent);
                }
                return false;
            };

            // First, find all "leaf" categories (most specific selections)
            const leafCategories = selectedCategories.filter(category => {
                return !selectedCategories.some(otherCategory => {
                    return otherCategory.id !== category.id &&
                        isParentOf(otherCategory, category);
                });
            });

            // Add all leaf categories and their descendants
            leafCategories.forEach(category => {
                const allSubcategoryIds = getAllSubcategoryIds(category);
                allSubcategoryIds.forEach(id => includedCategoryIds.add(id));
            });

            // If no leaf categories found (only parents selected), include all selected parents and their descendants
            if (leafCategories.length === 0) {
                selectedCategories.forEach(category => {
                    const allSubcategoryIds = getAllSubcategoryIds(category);
                    allSubcategoryIds.forEach(id => includedCategoryIds.add(id));
                });
            }

            // Filter products based on included categories
            filtered = filtered.filter(product => includedCategoryIds.has(product.categoryId));
        }
        
        // Name search filtering
        if (filters.name.trim() !== '') {
            const searchTerm = filters.name.toLowerCase().trim();
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
        }
        
        // Price range filtering
        filtered = filtered.filter(product => 
            product.price >= filters.priceRange[0] && 
            product.price <= filters.priceRange[1]
        );
        
        // Rating filtering
        if (filters.minRating > 0) {
            filtered = filtered.filter(product => 
                (productRatings[product.id] || 0) >= filters.minRating
            );
        }
        
        // Size filtering
        if (filters.sizes.length > 0) {
            filtered = filtered.filter(product => {
                if (!product.stocks || product.stocks.length === 0) return false;
                return product.stocks.some(stock => 
                    filters.sizes.includes(stock.size) && stock.stock > 0
                );
            });
        }
        
        return filtered;
    }, [products, filters, findCategoryById, getAllSubcategoryIds, productRatings]);

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
                                checked={filters.category.includes(category.id)}
                                onChange={() => handleFilterChange('category', category.id)}
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
                                        fontWeight: filters.category.includes(category.id) ? 600 : 400,
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
                                    {countProductsInSubcategories(category)}
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

    // Add these functions for price range handling
    const handlePriceChange = (event, newValue) => {
        setFilters(prev => ({
            ...prev,
            priceRange: newValue
        }));
    };

    const handleNameFilterChange = (event) => {
        setFilters(prev => ({
            ...prev,
            name: event.target.value
        }));
    };

    const handleRatingChange = (value) => {
        setFilters(prev => ({
            ...prev,
            minRating: value
        }));
    };

    const handleSizeFilterChange = (size) => {
        setFilters(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };

    // Get all available sizes from products
    const availableSizes = useMemo(() => {
        const sizesSet = new Set();
        products.forEach(product => {
            if (product.stocks && product.stocks.length > 0) {
                product.stocks.forEach(stock => {
                    if (stock.stock > 0) {
                        sizesSet.add(stock.size);
                    }
                });
            }
        });
        return Array.from(sizesSet).sort();
    }, [products]);

    // Get the max price for the price range slider
    const maxPrice = useMemo(() => {
        if (products.length === 0) return 1000;
        const max = Math.max(...products.map(product => product.price));
        return Math.ceil(max / 100) * 100; // Round up to nearest 100
    }, [products]);

    // Update the initial state of the price range when products load
    useEffect(() => {
        if (products.length > 0) {
            setFilters(prev => ({
                ...prev,
                priceRange: [0, maxPrice]
            }));
        }
    }, [maxPrice, products.length]);

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

                        {/* Search Filter */}
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
                                Search
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Search products..."
                                variant="outlined"
                                value={filters.name}
                                onChange={handleNameFilterChange}
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.12)',
                                            borderRadius: '8px',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#2E7D32',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#2E7D32',
                                        },
                                    },
                                }}
                                InputProps={{
                                    endAdornment: filters.name ? (
                                        <IconButton
                                            size="small"
                                            onClick={() => setFilters(prev => ({ ...prev, name: '' }))}
                                        >
                                            <Box sx={{ fontSize: '1rem' }}>×</Box>
                                        </IconButton>
                                    ) : null,
                                }}
                            />
                        </Box>

                        {/* Categories Filter */}
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

                        {/* Price Range Filter */}
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
                                Price Range
                            </Typography>
                            <Box sx={{ px: 2, pt: 1 }}>
                                <Slider
                                    value={filters.priceRange}
                                    onChange={handlePriceChange}
                                    valueLabelDisplay="auto"
                                    min={0}
                                    max={maxPrice}
                                    sx={{
                                        color: '#2E7D32',
                                        '& .MuiSlider-thumb': {
                                            '&:hover, &.Mui-focusVisible': {
                                                boxShadow: '0px 0px 0px 8px rgba(46, 125, 50, 0.16)',
                                            },
                                        },
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        ${filters.priceRange[0]}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ${filters.priceRange[1]}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Rating Filter */}
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
                                Rating
                            </Typography>
                            <Box sx={{ px: 1 }}>
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <Box
                                        key={rating}
                                        onClick={() => handleRatingChange(rating)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            mb: 1,
                                            backgroundColor: filters.minRating === rating ? 'rgba(46, 125, 50, 0.08)' : 'transparent',
                                            '&:hover': {
                                                backgroundColor: 'rgba(46, 125, 50, 0.05)',
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                            {[...Array(5)].map((_, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        color: index < rating ? '#FFC107' : '#E0E0E0',
                                                        fontSize: '0.9rem',
                                                    }}
                                                >
                                                    ★
                                                </Box>
                                            ))}
                                        </Box>
                                        <Typography variant="body2" sx={{ color: '#555' }}>
                                            & Up
                                        </Typography>
                                    </Box>
                                ))}
                                {filters.minRating > 0 && (
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => handleRatingChange(0)}
                                        sx={{
                                            color: '#555',
                                            textTransform: 'none',
                                            fontSize: '0.8rem',
                                            mt: 1,
                                        }}
                                    >
                                        Clear Rating Filter
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {/* Size Filter */}
                        {availableSizes.length > 0 && (
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
                                    Size
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 1 }}>
                                    {availableSizes.map((size) => (
                                        <Box
                                            key={size}
                                            onClick={() => handleSizeFilterChange(size)}
                                            sx={{
                                                padding: '5px 10px',
                                                border: '1px solid',
                                                borderColor: filters.sizes.includes(size) ? '#2E7D32' : 'rgba(0, 0, 0, 0.12)',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                backgroundColor: filters.sizes.includes(size) ? 'rgba(46, 125, 50, 0.08)' : 'transparent',
                                                color: filters.sizes.includes(size) ? '#2E7D32' : '#555',
                                                fontWeight: filters.sizes.includes(size) ? 600 : 400,
                                                fontSize: '0.8rem',
                                                textAlign: 'center',
                                                '&:hover': {
                                                    borderColor: '#2E7D32',
                                                    backgroundColor: 'rgba(46, 125, 50, 0.05)',
                                                },
                                            }}
                                        >
                                            {size}
                                        </Box>
                                    ))}
                                </Box>
                                {filters.sizes.length > 0 && (
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => setFilters(prev => ({ ...prev, sizes: [] }))}
                                        sx={{
                                            color: '#555',
                                            textTransform: 'none',
                                            fontSize: '0.8rem',
                                            mt: 2,
                                        }}
                                    >
                                        Clear Size Filters
                                    </Button>
                                )}
                            </Box>
                        )}

                        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => setFilters({ category: [], name: '', priceRange: [0, maxPrice], minRating: 0, sizes: [] })}
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
                        {filteredProducts.length > 0 ? (
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
                        ) : (
                            <Box sx={{ 
                                textAlign: 'center', 
                                py: 8, 
                                backgroundColor: 'rgba(0,0,0,0.02)',
                                borderRadius: '12px'
                            }}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No products found matching your filters
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Try adjusting your filters to find what you're looking for
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default Products;