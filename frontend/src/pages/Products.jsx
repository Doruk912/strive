import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
    FormControl,
    Chip,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Sort as SortIcon,
    FilterList as FilterListIcon,
} from '@mui/icons-material';
import axios from 'axios';
import CartNotification from '../components/CartNotification';
import {Helmet} from "react-helmet";
import { useMediaQuery } from '@mui/material';

// Update color constants to match the brand color from Header.jsx
const primaryColor = '#1976d2'; // Primary blue color
const primaryDarkColor = '#1565c0'; // Darker blue color

// Create a separate component for category tree items
const CategoryTreeItem = ({ category, level, filters, handleFilterChange, countProductsInSubcategories, expandedCategories, toggleCategoryExpand }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories[category.id] === true;
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
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            toggleCategoryExpand(category.id);
                        }}
                        sx={{ mr: 1 }}
                    >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {category.children.map((child) => (
                            <CategoryTreeItem
                                key={child.id}
                                category={child}
                                level={level + 1}
                                filters={filters}
                                handleFilterChange={handleFilterChange}
                                countProductsInSubcategories={countProductsInSubcategories}
                                expandedCategories={expandedCategories}
                                toggleCategoryExpand={toggleCategoryExpand}
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
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [productRatings, setProductRatings] = useState({});
    const [notification] = useState({ open: false, product: null, quantity: 1 });
    
    // Mobile responsive states
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const isMobile = useMediaQuery('(max-width:900px)');
    
    // Sorting state
    const [sortOption, setSortOption] = useState('default');
    
    // Pagination state
    const [page, setPage] = useState(1);
    const productsPerPage = 12;
    const [totalProducts, setTotalProducts] = useState(0);
    
    // Price range input fields
    const [priceInputs, setPriceInputs] = useState({
        min: '0',
        max: '2000',
    });

    // Filter state
    const [filters, setFilters] = useState({
        category: [],
        name: '',
        priceRange: [0, 2000],
        minRating: 0,
        sizes: []
    });

    // Add a temporary name input state
    const [nameInput, setNameInput] = useState('');

    // Find a category by ID in the entire category tree (recursive)
    const findCategoryById = useCallback((categoryId) => {
        if (!categories || categories.length === 0) return null;
        
        // Helper function to search through category tree
        const searchInCategories = (categoryList, id) => {
            for (const category of categoryList) {
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
        if (!category) return [];
        
        const ids = [category.id];
        if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
                ids.push(...getAllSubcategoryIds(child));
            });
        }
        return ids;
    }, []);

    // Add a new effect to handle expandFilters parameter
    useEffect(() => {
        const expandFilters = searchParams.get('expandFilters');
        if (expandFilters === 'true') {
            setMobileFiltersOpen(true);
        }
    }, [searchParams]);
    
    // Update the useEffect that handles URL parameters
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category');
        const parentCategoryParam = params.get('parentCategory');
        const nameParam = params.get('name');
        const expandFiltersParam = params.get('expandFilters');

        // Only process filters when categories are loaded
        if (categories.length > 0) {
            let filterUpdates = {};

            // Process the category parameter
            if (categoryParam) {
                const categoryId = parseInt(categoryParam, 10);
                if (!isNaN(categoryId)) {
                    filterUpdates.category = [categoryId];

                    // Handle parent category expansion
                    if (parentCategoryParam) {
                        const parentId = parseInt(parentCategoryParam, 10);
                        if (!isNaN(parentId)) {
                            setExpandedCategories(prev => ({
                                ...prev,
                                [parentId]: true
                            }));
                        }
                    } else {
                        // If parent is not specified but category exists
                        const selectedCategory = findCategoryById(categoryId);
                        if (selectedCategory && selectedCategory.parent) {
                            setExpandedCategories(prev => ({
                                ...prev,
                                [selectedCategory.parent]: true
                            }));
                        }
                    }
                }
            }

            if (nameParam) {
                filterUpdates.name = nameParam;
                setNameInput(nameParam); // Also set the input field
            }

            if (Object.keys(filterUpdates).length > 0) {
                setFilters(prev => ({
                    ...prev,
                    ...filterUpdates
                }));
            }
        }

        // Handle expandFilters parameter separately
        if (expandFiltersParam === 'true') {
            setMobileFiltersOpen(true);
        }
    }, [location.search, categories, findCategoryById]); // Reduced dependencies

    // Fetch categories and products - modified to implement pagination
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Remove setLoading(true) from here as it's causing issues with infinite loading
                let productsResponse;
                let totalResults;
                let totalPagesFromResponse;

                // Ensure categories are loaded first if needed
                if (categories.length === 0) {
                    const categoriesResponse = await axios.get('http://localhost:8080/api/categories');
                    setCategories(categoriesResponse.data);
                }

                // Modified this part to always fetch products regardless of category filter
                const params = {
                    page: page - 1,
                    size: productsPerPage,
                    name: filters.name || null,
                    minPrice: filters.priceRange[0] || null,
                    maxPrice: filters.priceRange[1] || null,
                    minRating: filters.minRating > 0 ? filters.minRating : null,
                    sizes: filters.sizes.length > 0 ? filters.sizes.join(',') : null,
                    sort: sortOption !== 'default' ? sortOption : null
                };

                // Only add categoryIds if there are selected categories
                if (filters.category.length > 0) {
                    let selectedCategoryIds = [...filters.category];

                    // For each selected category, get all its descendants
                    filters.category.forEach(categoryId => {
                        const category = findCategoryById(categoryId);
                        if (category) {
                            const descendants = getAllSubcategoryIds(category);
                            selectedCategoryIds = [...selectedCategoryIds, ...descendants];
                        }
                    });

                    // Remove duplicates
                    selectedCategoryIds = [...new Set(selectedCategoryIds)];
                    params.categoryIds = selectedCategoryIds.join(',');
                }

                productsResponse = await axios.get('http://localhost:8080/api/products/paginated', { params });

                totalResults = productsResponse.data.totalElements;
                totalPagesFromResponse = Math.ceil(totalResults / productsPerPage);

                // If we're on a page that no longer exists after filtering
                if (totalResults > 0 && page > totalPagesFromResponse) {
                    setPage(totalPagesFromResponse);
                    return; // Exit early to avoid setting states with invalid data
                }

                setProducts(productsResponse.data.content);
                setTotalProducts(totalResults);

                // Fetch ratings only for current page products
                const currentProducts = productsResponse.data.content;
                const ratingPromises = currentProducts.map(product =>
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

        // Set loading to true only when starting a new fetch
        setLoading(true);
        fetchData();

    }, [page, filters, sortOption, productsPerPage, categories.length, findCategoryById, getAllSubcategoryIds]);

    // Add a dedicated effect that runs when categories are loaded
    useEffect(() => {
        // Only run if categories have been loaded
        if (categories.length === 0) return;

        const params = new URLSearchParams(location.search);
        const parentCategoryParam = params.get('parentCategory');

        // If parent category is specified in URL, make sure it's expanded
        if (parentCategoryParam) {
            const parentId = parseInt(parentCategoryParam, 10);
            if (!isNaN(parentId)) {
                // Force the parent category to be expanded
                setExpandedCategories(prev => ({
                    ...prev,
                    [parentId]: true
                }));
            }
        }
    }, [categories, location.search]);

    const handleFilterChange = (filterType, value) => {
        // Always reset to page 1 when applying a new filter
        setPage(1);

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

            // Expand all parent categories to make the selected subcategory visible
            expandParentCategories(category);

            return {
                ...prev,
                category: filtered
            };
        });
    };

    // Count products in a category and its subcategories
    const countProductsInSubcategories = useCallback((category) => {
        if (!category) return 0;

        const categoryIds = getAllSubcategoryIds(category);
        return products.filter(product => categoryIds.includes(product.categoryId)).length;
    }, [products, getAllSubcategoryIds]);

    // Update total pages calculation
    const totalPages = useMemo(() => {
        return Math.ceil(totalProducts / productsPerPage);
    }, [totalProducts, productsPerPage]);

    // Remove client-side filtering since we're doing server-side now
    // Current products is directly from the API response
    const currentProducts = products;

    // Handle sort change
    const handleSortChange = (event) => {
        // Reset to page 1 when changing sort order
        setPage(1);
        setSortOption(event.target.value);
    };

    // Get the max price for the price range slider with a proper default
    const maxPrice = useMemo(() => {
        // If no products loaded yet, use a high default value
        if (products.length === 0) return 2000;

        // Otherwise use the highest product price, with minimum of 2000
        const max = Math.max(...products.map(product => product.price));
        // Round up to nearest 100 and ensure it's at least 2000
        return Math.max(Math.ceil(max / 100) * 100, 2000);
    }, [products]);

    // Add a separate effect to fetch the highest price from all products (not just current page)
    useEffect(() => {
        // This effect should only run once on component mount
        const fetchMaxPrice = async () => {
            try {
                // We can use a dedicated endpoint for this or use the min/max filters of existing ones
                const response = await axios.get('http://localhost:8080/api/products/paginated', {
                    params: {
                        page: 0,
                        size: 1,
                        sort: 'price-high-low' // Sort by highest price first
                    }
                });

                // If we got products, update the max price inputs and filters
                if (response.data.content && response.data.content.length > 0) {
                    const highestPrice = response.data.content[0].price;
                    const roundedMax = Math.max(Math.ceil(highestPrice / 100) * 100, 2000);

                    setPriceInputs(prev => ({
                        ...prev,
                        max: roundedMax.toString()
                    }));

                    setFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], roundedMax]
                    }));
                }
            } catch (error) {
                console.error('Error fetching max price:', error);
            }
        };

        fetchMaxPrice();
    }, []); // Empty dependency array ensures it only runs once

    // Update the initial state of the price range when products load
    useEffect(() => {
        // Only update when maxPrice changes, not when products.length changes
            setPriceInputs({
                min: '0',
                max: maxPrice.toString()
            });
        // Only update filters when maxPrice changes significantly
        setFilters(prev => {
            // Don't update if the current max price is close enough
            if (Math.abs(prev.priceRange[1] - maxPrice) < 100) {
                return prev;
            }
            return {
                ...prev,
                priceRange: [prev.priceRange[0], maxPrice]
            };
        });
    }, [maxPrice]); // Remove products.length dependency

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

        // Ensure max is at least 1 to avoid division by zero issues
        max = Math.max(max, 1);

        // Update UI state to reflect validated values
        setPriceInputs({
            min: min.toString(),
            max: max.toString()
        });

        // Only apply to filters if values have actually changed
        if (min !== filters.priceRange[0] || max !== filters.priceRange[1]) {
            // Reset to page 1 when changing filters to avoid pagination issues
            setPage(1);
        // Apply to filters
        setFilters(prev => ({
            ...prev,
            priceRange: [min, max]
        }));
        }
    };

    // Modify the handleNameFilterChange function to update temporary state instead of filter
    const handleNameFilterChange = (event) => {
        setNameInput(event.target.value);
    };

    // Add a new function to apply the name filter
    const applyNameFilter = () => {
        // Reset to page 1 when search filter changes
        setPage(1);
        setFilters(prev => ({
            ...prev,
            name: nameInput
        }));
    };

    // Add a function to clear the search
    const clearNameFilter = () => {
        // Clear the input field
        setNameInput('');
        
        // Only trigger a page reset and filter change if there was a filter applied
        if (filters.name) {
            // Reset to page 1 when removing filter
            setPage(1);
            
            // Update the filters state to remove the name filter
            setFilters(prev => ({
                ...prev,
                name: ''
            }));
        }
    };

    const handleRatingChange = (value) => {
        // Reset to page 1 when rating filter changes
        setPage(1);
        setFilters(prev => ({
            ...prev,
            minRating: value
        }));
    };

    const handleSizeFilterChange = (size) => {
        // Reset to page 1 when size filter changes
        setPage(1);
        setFilters(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };

    // Helper function to expand all parent categories of a selected category
    const expandParentCategories = useCallback((category) => {
        if (!category || !category.parent) return;

        let parentId = category.parent;
        while (parentId) {
            setExpandedCategories(prev => ({
                ...prev,
                [parentId]: true
            }));
            const parentCategory = findCategoryById(parentId);
            parentId = parentCategory?.parent || null;
        }
    }, [findCategoryById]);

    const toggleCategoryExpand = (categoryId) => {
        // Create a new object with the old state
        const newExpandedCategories = {...expandedCategories};
        // Toggle the state for the specific category
        newExpandedCategories[categoryId] = !expandedCategories[categoryId];
        // Set the new state directly
        setExpandedCategories(newExpandedCategories);
    };

    // Restore the previous effect for expandedCategories and filters
    useEffect(() => {
        if (!categories.length || !filters.category.length) return;
        filters.category.forEach(categoryId => {
            const category = findCategoryById(categoryId);
            if (category && category.parent) {
                setExpandedCategories(prev => ({
                    ...prev,
                    [category.parent]: true
                }));
            }
        });
    }, [filters.category, categories, findCategoryById]);

    // Log expandedCategories when it changes
    useEffect(() => {
        console.log('expandedCategories state:', expandedCategories);
    }, [expandedCategories]);

    // Remove the client-side filtering and sorting since we moved to server-side
    // Instead of calculating filteredProducts and sortedFilteredProducts, use direct API results
    const displayedProductsCount = totalProducts;
    const currentPageProductsCount = products.length;

    // Display count now comes from the API response total
    const showingStartIndex = products.length > 0 ? (page - 1) * productsPerPage + 1 : 0;
    const showingEndIndex = showingStartIndex + products.length - 1;

    // Update the clearAllFilters function to also clear the nameInput
    const clearAllFilters = () => {
        // Reset to page 1
        setPage(1);

        // Reset all filters to initial values
        setFilters({
            category: [],
            name: '',
            priceRange: [0, maxPrice],
            minRating: 0,
            sizes: []
        });

        // Also reset input fields to match
        setPriceInputs({
            min: '0',
            max: maxPrice.toString()
        });
        
        // Clear the name input
        setNameInput('');
    };

    // Helper function to get all descendant category IDs - define outside useEffect for better scope
    const getAllDescendantIds = useCallback((category) => {
        let ids = [];
        if (!category || !category.children) return ids;

        category.children.forEach(child => {
            ids.push(child.id);
            if (child.children) {
                ids = [...ids, ...getAllDescendantIds(child)];
            }
        });

        return ids;
    }, []);

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
            <Box sx={{ pt: 0, pb: 4, px: { xs: 1.5, sm: 3, md: 4 } }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    mb: { xs: 2, sm: 2 },
                    mt: 1,
                    gap: { xs: 1, sm: 0 },
                }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 700,
                            color: '#2B2B2B',
                            mb: { xs: 0.5, sm: 0 },
                            fontSize: { xs: '1.4rem', sm: '1.5rem' },
                        }}
                    >
                        STRIVE | Products
                    </Typography>

                    {/* Improved sorting component with entire field clickable */}
                    {products.length > 0 && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            backgroundColor: '#f8f8f8',
                            borderRadius: '8px',
                            padding: '4px 12px',
                            border: '1px solid #eaeaea',
                            cursor: 'pointer', // Add cursor pointer to entire box
                            width: { xs: '100%', sm: 'auto' }, // Full width on mobile
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
                    {/* Filters sidebar - collapsible on mobile */}
                    <Box
                        component="aside"
                        sx={{
                            width: { xs: '100%', md: '280px' },
                            flexShrink: 0,
                            mb: { xs: 2, md: 0 },
                            border: { xs: '1px solid #eaeaea', md: 'none' },
                            borderRadius: { xs: '8px', md: 0 },
                            overflow: 'hidden',
                        }}
                    >
                        {/* Filters header - clickable on mobile to expand/collapse */}
                        <Box
                            onClick={() => setMobileFiltersOpen(prev => !prev)}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: { xs: 2, md: 0 },
                                pb: { xs: 1.5, md: 0 },
                                mb: 2,
                                cursor: { xs: 'pointer', md: 'default' },
                                backgroundColor: { xs: '#f9f9f9', md: 'transparent' },
                            }}
                        >
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

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {/* Active filters indicator */}
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
                                        sx={{ fontSize: '0.7rem', mr: { xs: 1, md: 0 } }}
                                    />
                                )}

                                {/* Mobile toggle icon */}
                                <IconButton
                                    size="small"
                                    sx={{
                                        display: { xs: 'flex', md: 'none' },
                                        p: 0.5
                                    }}
                                >
                                    {mobileFiltersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Filters content - collapsible on mobile */}
                        <Collapse in={mobileFiltersOpen || !isMobile} timeout="auto">
                            <Box sx={{ p: { xs: 2, md: 0 }, pt: { xs: 0, md: 0 } }}>
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
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            fullWidth
                                            placeholder="Search products..."
                                            variant="outlined"
                                            value={nameInput}
                                            onChange={handleNameFilterChange}
                                            size="small"
                                            sx={{
                                                flex: 1,
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
                                                endAdornment: nameInput ? (
                                                    <IconButton
                                                        size="small"
                                                        onClick={clearNameFilter}
                                                    >
                                                        <Box sx={{ fontSize: '1rem' }}>×</Box>
                                                    </IconButton>
                                                ) : null,
                                            }}
                                            // Add onKeyPress handler to apply filter on Enter key
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    applyNameFilter();
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={applyNameFilter}
                                            sx={{
                                                backgroundColor: primaryColor,
                                                '&:hover': {
                                                    backgroundColor: primaryDarkColor,
                                                },
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '0.8rem',
                                                minWidth: '60px',
                                            }}
                                        >
                                            Search
                                        </Button>
                                    </Box>
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
                                            .map(category => (
                                                <CategoryTreeItem
                                                    key={category.id}
                                                    category={category}
                                                    level={0}
                                                    filters={filters}
                                                    handleFilterChange={handleFilterChange}
                                                    countProductsInSubcategories={countProductsInSubcategories}
                                                    expandedCategories={expandedCategories}
                                                    toggleCategoryExpand={toggleCategoryExpand}
                                                />
                                            ))}
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

                                {/* Mobile-only filter actions */}
                                <Box
                                    sx={{
                                        mt: 3,
                                        pt: 2,
                                        borderTop: '1px solid rgba(0,0,0,0.08)',
                                        display: { xs: 'flex', md: 'block' },
                                        gap: 2
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => {
                                            setMobileFiltersOpen(false);
                                        }}
                                        sx={{
                                            display: { xs: 'block', md: 'none' },
                                            backgroundColor: primaryColor,
                                            '&:hover': {
                                                backgroundColor: primaryDarkColor,
                                            },
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        Apply Filters
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={clearAllFilters}
                                        sx={{
                                            color: primaryColor,
                                            borderColor: primaryColor,
                                            fontWeight: 600,
                                            textTransform: { xs: 'none', md: 'uppercase' },
                                            letterSpacing: { xs: 0, md: '0.5px' },
                                            fontSize: '0.9rem',
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
                        </Collapse>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        {products.length > 0 ? (
                            <>
                                <Box sx={{
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 1
                                }}>
                                    <Chip
                                        label={`${displayedProductsCount} products found`}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#f0f0f0',
                                            color: 'text.secondary',
                                            fontWeight: 500,
                                            fontSize: '0.8rem',
                                        }}
                                    />
                                    {filters.name && (
                                        <Box
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                backgroundColor: `${primaryColor}10`,
                                                color: primaryColor,
                                                borderRadius: '16px',
                                                padding: '0 12px',
                                                height: '24px',
                                                fontSize: '0.8rem',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Search: {filters.name}
                                        </Box>
                                    )}
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            ml: { xs: 0, sm: 'auto' },
                                            fontSize: '0.85rem',
                                            width: { xs: '100%', sm: 'auto' },
                                            mt: { xs: 1, sm: 0 },
                                            order: { xs: 3, sm: 0 },
                                        }}
                                    >
                                        {products.length > 0 ? `Showing ${showingStartIndex}-${showingEndIndex} of ${displayedProductsCount}` : 'No products found'}
                                    </Typography>
                                </Box>
                                <Grid container spacing={{ xs: 2, md: 3 }}>
                                    {products.map((product) => (
                                        <Grid item xs={6} sm={6} md={4} lg={3} key={product.id}>
                                            <Card
                                                onClick={() => navigate(`/product/${product.id}`)}
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    borderRadius: '12px',
                                                    border: '1px solid rgba(0,0,0,0.08)',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                    width: '100%',
                                                    aspectRatio: { xs: '1/1.6', sm: '1/1.4' },
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                        borderColor: 'rgba(0,0,0,0.12)'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ position: 'relative', flex: '1 0 auto', height: { xs: '60%', sm: '65%' } }}>
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
                                                            padding: { xs: '2px 6px', sm: '4px 10px' },
                                                            borderRadius: '16px',
                                                            fontSize: { xs: '0.6rem', sm: '0.7rem' },
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
                                                <Box sx={{
                                                    p: { xs: 1.5, sm: 2 },
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    height: { xs: '40%', sm: '35%' },
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                                            fontWeight: 600,
                                                            mb: 0.5,
                                                            color: '#2B2B2B',
                                                            fontFamily: "'Montserrat', sans-serif",
                                                            lineHeight: 1.3,
                                                            // Make sure the title is limited to 2 lines on mobile
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                        }}
                                                    >
                                                        {product.name}
                                                    </Typography>

                                                    {/* Rating - Updated with half stars and bigger size */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.4, sm: 0.8 } }}>
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
                                                                        fontSize: { xs: '0.8rem', sm: '1rem' },
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
                                                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
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
                                                            color: primaryColor,
                                                            fontWeight: 700,
                                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                                            fontFamily: "'Playfair Display', serif",
                                                            mt: { xs: 'auto', sm: 'auto' }, // Keep at the bottom
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
                                    <Stack spacing={2} sx={{
                                        mt: { xs: 3, md: 4 },
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <Pagination
                                            count={totalPages}
                                            page={page}
                                            onChange={handlePageChange}
                                            color="primary"
                                            size={isMobile ? "medium" : "large"}
                                            siblingCount={isMobile ? 0 : 1}
                                            sx={{
                                                '& .MuiPaginationItem-root': {
                                                    color: '#555',
                                                    fontWeight: 500,
                                                    fontSize: { xs: '0.8rem', sm: 'inherit' },
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
                                py: { xs: 6, sm: 8 },
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
                                    onClick={clearAllFilters}
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