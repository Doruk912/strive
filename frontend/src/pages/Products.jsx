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
    Pagination,
    Stack,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Chip,
    Divider,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Sort as SortIcon,
    FilterList as FilterListIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import CartNotification from '../components/CartNotification';
import {Helmet} from "react-helmet";

// Update color constants to match the brand color from Header.jsx
const primaryColor = '#1976d2'; // Primary blue color
const primaryLightColor = '#2196f3'; // Lighter blue color
const primaryDarkColor = '#1565c0'; // Darker blue color

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
    
    // Sorting state
    const [sortOption, setSortOption] = useState('default');
    
    // Pagination state
    const [page, setPage] = useState(1);
    const productsPerPage = 12;
    
    // Price range input fields
    const [priceInputs, setPriceInputs] = useState({
        min: '0',
        max: '1000',
    });

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
        const nameParam = params.get('name');
        
        let updates = {};
        
        if (categoryParam) {
            const category = categories.find(cat => cat.name === categoryParam);
            if (category) {
                updates.category = [category.id];
            }
        }
        
        if (nameParam) {
            updates.name = nameParam;
        }
        
        if (Object.keys(updates).length > 0) {
            setFilters(prev => ({
                ...prev,
                ...updates
            }));
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

    // Sort products function
    const sortProducts = useCallback((products) => {
        if (!products || products.length === 0) return [];
        
        switch (sortOption) {
            case 'price-low-high':
                return [...products].sort((a, b) => a.price - b.price);
            case 'price-high-low':
                return [...products].sort((a, b) => b.price - a.price);
            case 'rating-high-low':
                return [...products].sort((a, b) => (productRatings[b.id] || 0) - (productRatings[a.id] || 0));
            case 'name-a-z':
                return [...products].sort((a, b) => a.name.localeCompare(b.name));
            case 'name-z-a':
                return [...products].sort((a, b) => b.name.localeCompare(a.name));
            default:
                return products;
        }
    }, [sortOption, productRatings]);

    // Apply sorting to filtered products
    const sortedFilteredProducts = useMemo(() => {
        return sortProducts(filteredProducts);
    }, [filteredProducts, sortProducts]);
    
    // Update current products to use sorted filtered products
    const currentProducts = useMemo(() => {
        const indexOfLastProduct = page * productsPerPage;
        const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
        return sortedFilteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    }, [sortedFilteredProducts, page, productsPerPage]);
    
    // Update total pages calculation
    const totalPages = useMemo(() => {
        return Math.ceil(sortedFilteredProducts.length / productsPerPage);
    }, [sortedFilteredProducts, productsPerPage]);

    // Handle sort change
    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    // Get the max price for the price range slider
    const maxPrice = useMemo(() => {
        if (products.length === 0) return 1000;
        const max = Math.max(...products.map(product => product.price));
        return Math.ceil(max / 100) * 100; // Round up to nearest 100
    }, [products]);

    // Update the initial state of the price range when products load
    useEffect(() => {
        if (products.length > 0) {
            // Only update the inputs, not the filters on initial load
            setPriceInputs({
                min: '0',
                max: maxPrice.toString()
            });
            // Initialize the filters with the full range - will only change when "Apply" is clicked
            setFilters(prev => ({
                ...prev,
                priceRange: [0, maxPrice]
            }));
        }
    }, [maxPrice, products.length]);
    
    // Handle page change
    const handlePageChange = (event, value) => {
        setPage(value);
        // Scroll to top when changing page
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    // Reset to first page when filters change
    useEffect(() => {
        setPage(1);
    }, [filters]);

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

    const handlePriceChange = (event, newValue) => {
        // Only update the input fields, not the actual filter
        setPriceInputs({
            min: newValue[0].toString(),
            max: newValue[1].toString()
        });
    };
    
    const handlePriceInputChange = (type, rawValue) => {
        // Allow empty string for better editing experience
        if (rawValue === '') {
            setPriceInputs(prev => ({
                ...prev,
                [type]: ''
            }));
            return;
        }
        
        // Convert to number and check if it's a valid number
        const value = Number(rawValue);
        if (isNaN(value)) {
            return; // Don't update if not a valid number
        }
        
        // Only allow non-negative integers
        if (value < 0 || !Number.isInteger(value)) {
            return;
        }
        
        // Apply max constraints
        if (type === 'max' && value > maxPrice) {
            setPriceInputs(prev => ({
                ...prev,
                max: maxPrice.toString()
            }));
            return;
        }
        
        // Store as string to allow for empty input during editing
        setPriceInputs(prev => ({
            ...prev,
            [type]: rawValue
        }));
    };
    
    const resetPriceFilter = () => {
        // Reset to default values (0 to maxPrice)
        setPriceInputs({
            min: '0',
            max: maxPrice.toString()
        });
        // Don't apply to filters yet - user needs to press Apply button
    };

    const applyPriceFilter = () => {
        // Parse inputs as numbers
        let min = priceInputs.min === '' ? 0 : Number(priceInputs.min);
        let max = priceInputs.max === '' ? maxPrice : Number(priceInputs.max);
        
        // Ensure min doesn't exceed max
        if (min > max) {
            min = max;
        }
        
        // Update UI state to reflect validated values
        setPriceInputs({
            min: min.toString(),
            max: max.toString()
        });
        
        // Apply to filters
        setFilters(prev => ({
            ...prev,
            priceRange: [min, max]
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

    // Modify the renderCategoryTree function to remove the gray background
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
                        // Remove the gray background
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
                                        color: primaryColor,
                                    },
                                    '&:hover': {
                                        backgroundColor: `${primaryColor}08`,
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
                                    ({countProductsInSubcategories(category)})
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
                                backgroundColor: `${primaryColor}08`,
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
            <Box sx={{ pt: 0, pb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    mb: 2,
                    mt: 1,
                }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 700,
                            color: '#2B2B2B',
                            mb: { xs: 1, sm: 0 },
                        }}
                    >
                        STRIVE | Products
                    </Typography>

                    {/* Improved sorting component with entire field clickable */}
                    {sortedFilteredProducts.length > 0 && (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 1,
                            backgroundColor: '#f8f8f8',
                            borderRadius: '8px',
                            padding: '4px 12px',
                            border: '1px solid #eaeaea',
                            cursor: 'pointer', // Add cursor pointer to entire box
                        }}>
                            <SortIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
                            <FormControl variant="standard" sx={{ minWidth: 140, border: 'none', width: '100%' }}>
                                <Select
                                    value={sortOption}
                                    onChange={handleSortChange}
                                    disableUnderline
                                    sx={{
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        color: 'text.primary',
                                        width: '100%',
                                        cursor: 'pointer',
                                        '& .MuiSelect-select': {
                                            py: 1,
                                            pr: 3,
                                            width: '100%',
                                        },
                                        '&:before, &:after': { 
                                            display: 'none' // Remove borders that might affect clicking
                                        },
                                        '.MuiSelect-root': {
                                            width: '100%',
                                            display: 'block'
                                        }
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                borderRadius: '8px',
                                                mt: 1,
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="default">Default</MenuItem>
                                    <MenuItem value="price-low-high">Price: Low to High</MenuItem>
                                    <MenuItem value="price-high-low">Price: High to Low</MenuItem>
                                    <MenuItem value="rating-high-low">Rating: High to Low</MenuItem>
                                    <MenuItem value="name-a-z">Name: A to Z</MenuItem>
                                    <MenuItem value="name-z-a">Name: Z to A</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ width: { xs: '100%', md: '280px' }, flexShrink: 0 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 2,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FilterListIcon sx={{ color: primaryColor, mr: 1, fontSize: '1.2rem' }} />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontFamily: "'Montserrat', sans-serif",
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        color: '#2B2B2B',
                                    }}
                                >
                                    Filters
                                </Typography>
                            </Box>
                            
                            {/* Add an active filters count */}
                            {(filters.category.length > 0 || 
                              filters.sizes.length > 0 || 
                              filters.name !== '' || 
                              filters.minRating > 0 || 
                              filters.priceRange[0] > 0 || 
                              filters.priceRange[1] < maxPrice) && (
                                <Chip 
                                    label={`Active filters`} 
                                    size="small" 
                                    color="primary"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                />
                            )}
                        </Box>

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
                                        backgroundColor: primaryColor,
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
                                            borderColor: primaryColor,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: primaryColor,
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
                                        backgroundColor: primaryColor,
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

                        {/* Price Range Filter - Updated */}
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
                                        backgroundColor: primaryColor,
                                        marginRight: '8px',
                                        borderRadius: '2px',
                                    }
                                }}
                            >
                                Price Range
                            </Typography>
                            <Box sx={{ px: 2, pt: 1 }}>
                                <Slider
                                    value={[
                                        priceInputs.min === '' ? 0 : Number(priceInputs.min),
                                        priceInputs.max === '' ? maxPrice : Number(priceInputs.max)
                                    ]}
                                    onChange={handlePriceChange}
                                    valueLabelDisplay="auto"
                                    min={0}
                                    max={maxPrice}
                                    sx={{
                                        color: primaryColor,
                                        '& .MuiSlider-thumb': {
                                            '&:hover, &.Mui-focusVisible': {
                                                boxShadow: `0px 0px 0px 8px ${primaryColor}30`,
                                            },
                                        },
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, gap: 2 }}>
                                    <TextField
                                        size="small"
                                        label="Min $"
                                        type="number"
                                        InputProps={{
                                            inputProps: { 
                                                min: 0
                                            }
                                        }}
                                        value={priceInputs.min}
                                        onChange={(e) => handlePriceInputChange('min', e.target.value)}
                                        sx={{
                                            width: '50%',
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.12)' },
                                                '&:hover fieldset': { borderColor: primaryColor },
                                                '&.Mui-focused fieldset': { borderColor: primaryColor },
                                            },
                                        }}
                                    />
                                    <TextField
                                        size="small"
                                        label="Max $"
                                        type="number"
                                        InputProps={{
                                            inputProps: { 
                                                min: 0
                                            }
                                        }}
                                        value={priceInputs.max}
                                        onChange={(e) => handlePriceInputChange('max', e.target.value)}
                                        sx={{
                                            width: '50%',
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.12)' },
                                                '&:hover fieldset': { borderColor: primaryColor },
                                                '&.Mui-focused fieldset': { borderColor: primaryColor },
                                            },
                                        }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={resetPriceFilter}
                                        sx={{
                                            flex: 1,
                                            color: primaryColor,
                                            borderColor: primaryColor,
                                            '&:hover': {
                                                borderColor: primaryColor,
                                                backgroundColor: `${primaryColor}10`,
                                            },
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={applyPriceFilter}
                                        sx={{
                                            flex: 1,
                                            backgroundColor: primaryColor,
                                            '&:hover': {
                                                backgroundColor: primaryDarkColor,
                                            },
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        Apply
                                    </Button>
                                </Box>
                            </Box>
                        </Box>

                        {/* Rating Filter - Updated */}
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
                                        backgroundColor: primaryColor,
                                        marginRight: '8px',
                                        borderRadius: '2px',
                                    }
                                }}
                            >
                                Rating
                            </Typography>
                            <Box sx={{ px: 1 }}>
                                {/* Add All option */}
                                <Box
                                    onClick={() => handleRatingChange(0)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        mb: 1,
                                        backgroundColor: filters.minRating === 0 ? `${primaryColor}10` : 'transparent',
                                        '&:hover': {
                                            backgroundColor: `${primaryColor}08`,
                                        },
                                    }}
                                >
                                    <Typography variant="body2" sx={{ color: '#555', fontWeight: filters.minRating === 0 ? 600 : 400 }}>
                                        All Ratings
                                    </Typography>
                                </Box>
                                {/* 4 to 1 stars */}
                                {[4, 3, 2, 1].map((rating) => (
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
                                            backgroundColor: filters.minRating === rating ? `${primaryColor}10` : 'transparent',
                                            '&:hover': {
                                                backgroundColor: `${primaryColor}08`,
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
                                            backgroundColor: primaryColor,
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
                                                borderColor: filters.sizes.includes(size) ? primaryColor : 'rgba(0, 0, 0, 0.12)',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                backgroundColor: filters.sizes.includes(size) ? `${primaryColor}10` : 'transparent',
                                                color: filters.sizes.includes(size) ? primaryColor : '#555',
                                                fontWeight: filters.sizes.includes(size) ? 600 : 400,
                                                fontSize: '0.8rem',
                                                textAlign: 'center',
                                                '&:hover': {
                                                    borderColor: primaryColor,
                                                    backgroundColor: `${primaryColor}08`,
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
                                onClick={() => {
                                    // Reset all filters
                                    setFilters({ 
                                        category: [], 
                                        name: '', 
                                        priceRange: [0, maxPrice], 
                                        minRating: 0, 
                                        sizes: [] 
                                    });
                                    // Also reset price inputs to match
                                    setPriceInputs({ 
                                        min: '0', 
                                        max: maxPrice.toString() 
                                    });
                                }}
                                sx={{
                                    color: primaryColor,
                                    borderColor: primaryColor,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontSize: '0.8rem',
                                    padding: '8px 16px',
                                    '&:hover': {
                                        borderColor: primaryColor,
                                        backgroundColor: `${primaryColor}08`,
                                    },
                                }}
                            >
                                Clear All Filters
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        {sortedFilteredProducts.length > 0 ? (
                            <>
                                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                    <Chip
                                        label={`${sortedFilteredProducts.length} products found`}
                                        size="small"
                                        sx={{ 
                                            backgroundColor: '#f0f0f0',
                                            color: 'text.secondary',
                                            fontWeight: 500,
                                            fontSize: '0.8rem',
                                        }}
                                    />
                                    {filters.name && (
                                        <Chip
                                            label={`Search: ${filters.name}`}
                                            size="small"
                                            onDelete={() => setFilters(prev => ({ ...prev, name: '' }))}
                                            sx={{ 
                                                ml: 1,
                                                backgroundColor: `${primaryColor}10`,
                                                color: primaryColor,
                                                fontWeight: 500,
                                                fontSize: '0.8rem',
                                            }}
                                        />
                                    )}
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ ml: 'auto', fontSize: '0.85rem' }}
                                    >
                                        Showing {Math.min(sortedFilteredProducts.length, (page - 1) * productsPerPage + 1)}-
                                        {Math.min(page * productsPerPage, sortedFilteredProducts.length)} of {sortedFilteredProducts.length}
                                    </Typography>
                                </Box>
                                <Grid container spacing={3}>
                                    {currentProducts.map((product) => (
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

                                                    {/* Rating - Updated with half stars and bigger size */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
                                                        {[...Array(5)].map((_, index) => {
                                                            const rating = productRatings[product.id] || 0;
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
                                                                fontSize: '0.8rem',
                                                                fontWeight: 500,
                                                        }}
                                                    >
                                                            ({(productRatings[product.id] || 0).toFixed(1)})
                                                    </Typography>
                                                </Box>

                                                {/* Price */}
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        mt: 'auto',
                                                            color: primaryColor,
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
                                
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Stack spacing={2} sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
                                        <Pagination 
                                            count={totalPages} 
                                            page={page} 
                                            onChange={handlePageChange}
                                            color="primary"
                                            size="large"
                                            sx={{
                                                '& .MuiPaginationItem-root': {
                                                    color: '#555',
                                                    fontWeight: 500,
                                                },
                                                '& .MuiPaginationItem-page.Mui-selected': {
                                                    backgroundColor: primaryColor,
                                                    color: '#fff',
                                                    '&:hover': {
                                                        backgroundColor: primaryDarkColor,
                                                    },
                                                },
                                            }}
                                        />
                                    </Stack>
                                )}
                            </>
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
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    sx={{ mt: 2 }}
                                    onClick={() => {
                                        setFilters({ 
                                            category: [], 
                                            name: '', 
                                            priceRange: [0, maxPrice], 
                                            minRating: 0, 
                                            sizes: [] 
                                        });
                                        setPriceInputs({ 
                                            min: '0', 
                                            max: maxPrice.toString() 
                                        });
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default Products;