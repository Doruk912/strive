import React, { useState, useEffect, useCallback } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
    TextField,
    Button,
    Typography,
    Fade,
    ClickAwayListener,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemText,
    useMediaQuery,
    useTheme,
    Paper,
    Grid,
    Badge,
    Collapse,
    MenuItem,
    ListItemIcon,
    Menu,
    ListItemButton,
    SwipeableDrawer,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import CloseIcon from '@mui/icons-material/Close';
import {ShoppingBag} from "@mui/icons-material";
import axios from 'axios';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [searchHistory, setSearchHistory] = useState(() => {
        const savedHistory = localStorage.getItem('searchHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });
    const [popularSearches] = useState([
        'basketball', 'tech', 'air force', 'running shoes', 'dunk low', 'mont', 'sports gear'
    ]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);
    
    // Use theme and improved breakpoints
    const theme = useTheme();
    const isExtraSmall = useMediaQuery(theme.breakpoints.down('sm')); // <600px
    const isSmall = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600px-900px
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // <900px
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900px-1200px
    
    const cartItemsCount = cartItems.length;

    // State for hover-based dropdown
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    
    // Database categories state
    const [dbCategories, setDbCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    // Add this new state for category structure
    const [categoryStructure, setCategoryStructure] = useState(new Map());

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    // Fetch categories from database
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoadingCategories(true);
                const response = await axios.get('http://localhost:8080/api/categories');
                setDbCategories(response.data);

                // Build category structure map
                const structure = new Map();
                response.data.forEach(category => {
                    structure.set(category.id, {
                        ...category,
                        parentChain: []
                    });
                });

                // Add parent chain information
                response.data.forEach(category => {
                    if (category.parent) {
                        let parentChain = [];
                        let currentCat = category;
                        while (currentCat && currentCat.parent) {
                            parentChain.unshift(currentCat.parent);
                            currentCat = structure.get(currentCat.parent);
                        }
                        structure.get(category.id).parentChain = parentChain;
                    }
                });

                setCategoryStructure(structure);

            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Prepare categories for display
    const categories = dbCategories.length > 0
        ? dbCategories
            .filter(category => !category.parent) // Only root categories
            .map(category => ({
                id: category.id,
                name: category.name.toUpperCase(),
                path: `/products?category=${category.id}`,
                subcategories: category.children ?
                    category.children.map(child => ({
                        id: child.id,
                        name: child.name.toUpperCase()
                    })) : [],
                children: category.children || []
            }))
        : [
            {
                name: 'NEW',
                path: '/new',
                subcategories: ['TRENDING PRODUCTS', 'NEW ARRIVALS', 'HIGHLIGHTS'],
            },
            {
                name: 'MEN',
                path: '/men',
                subcategories: ['JACKETS', 'BOOTS', 'PANTS', 'INNERWEAR', 'ACCESSORIES', 'HIGHLIGHTS'],
            },
            {
                name: 'WOMEN',
                path: '/women',
                subcategories: ['JACKETS', 'BOOTS', 'PANTS', 'INNERWEAR', 'ACCESSORIES', 'HIGHLIGHTS'],
            },
            {
                name: 'SPORTS',
                path: '/sports',
                subcategories: ['BASKETBALL', 'SOCCER', 'BASEBALL', 'TENNIS', 'RUNNING', 'YOGA'],
            },
        ];

    useEffect(() => {
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }, [searchHistory]);

    // Hover handlers for dropdown
    const handleMouseEnter = (category) => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
        setHoveredCategory(category);
    };

    const handleMouseLeave = () => {
        const timeout = setTimeout(() => {
            setHoveredCategory(null);
        }, 300);
        setHoverTimeout(timeout);
    };

    const handleDropdownMouseEnter = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
    };

    const handleSearchClick = () => {
        setSearchExpanded(true);
    };

    const handleSearchClose = () => {
        setSearchExpanded(false);
        setSearchValue('');
    };

    const handleSearchChange = (event) => {
        setSearchValue(event.target.value);
    };

    const handleSearch = useCallback(() => {
        if (searchValue.trim()) {
            if (!searchHistory.includes(searchValue.trim())) {
                setSearchHistory(prev => [searchValue.trim(), ...prev.slice(0, 4)]);
            } else {
                setSearchHistory(prev => [
                    searchValue.trim(),
                    ...prev.filter(item => item !== searchValue.trim())
                ]);
            }
            navigate(`/products?name=${encodeURIComponent(searchValue.trim())}`);
            handleSearchClose();
        }
    }, [searchValue, searchHistory, navigate]);

    const handlePopularSearchClick = (term) => {
        setSearchValue(term);

        const trimmedTerm = term.trim();
        if (trimmedTerm) {
            if (!searchHistory.includes(trimmedTerm)) {
                setSearchHistory(prev => [trimmedTerm, ...prev.slice(0, 4)]);
            } else {
                setSearchHistory(prev => [
                    trimmedTerm,
                    ...prev.filter(item => item !== trimmedTerm)
                ]);
            }
            navigate(`/products?name=${encodeURIComponent(trimmedTerm)}`);
            handleSearchClose();
        }
    };

    const handleHistoryItemClick = (term) => {
        const trimmedTerm = term.trim();
        if (trimmedTerm) {
            setSearchHistory(prev => [
                trimmedTerm,
                ...prev.filter(item => item !== trimmedTerm)
            ]);
            navigate(`/products?name=${encodeURIComponent(trimmedTerm)}`);
            handleSearchClose();
        }
    };

    const removeHistoryItem = (event, term) => {
        event.stopPropagation();
        setSearchHistory(prev => prev.filter(item => item !== term));
    };

    const clearSearchHistory = () => {
        setSearchHistory([]);
    };

    const handleKeyDown = useCallback((event) => {
        if (searchExpanded) {
            if (event.key === 'Escape') {
                handleSearchClose();
            } else if (event.key === 'Enter') {
                handleSearch();
            }
        }
    }, [searchExpanded, handleSearch]);

    // Handle subcategory navigation with proper filtering
    const handleSubcategoryClick = (categoryObj, subcategoryObj) => {
        if (categoryStructure.size > 0) {
            const subcategoryId = subcategoryObj.id;
            const category = categoryStructure.get(subcategoryId);

            if (category) {
                const queryParams = new URLSearchParams();
                queryParams.set('category', subcategoryId);
                queryParams.set('expandFilters', 'true');

                // Add all parent categories to the chain
                if (category.parentChain && category.parentChain.length > 0) {
                    queryParams.set('parentChain', category.parentChain.join(','));
                }

                // Navigate with all parameters
                navigate(`/products?${queryParams.toString()}`);
            } else {
                // Fallback navigation
                navigate(`/products?category=${subcategoryId}&expandFilters=true`);
            }
        } else {
            // Fallback for old category structure
            const categoryName = typeof categoryObj === 'string' ? categoryObj : categoryObj.name;
            const subcategoryName = typeof subcategoryObj === 'string' ? subcategoryObj : subcategoryObj.name;
            navigate(`/products?category=${subcategoryName.toLowerCase()}&parentCategory=${categoryName.toLowerCase()}&expandFilters=true`);
        }
        setHoveredCategory(null);
        setDrawerOpen(false);
    };

    const renderCategoryDropdown = (category) => (
        <Box
            onMouseEnter={() => handleMouseEnter(category)}
            onMouseLeave={handleMouseLeave}
            sx={{
                position: 'relative',
                cursor: 'pointer',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                    '& .MuiTypography-root': {
                        color: 'primary.main',
                        transform: 'translateY(-1px)',
                        transition: 'all 0.2s ease-in-out'
                    }
                }
            }}
        >
            <Typography
                sx={{
                    px: 2,
                    fontWeight: 500,
                    color: hoveredCategory === category ? 'primary.main' : 'text.primary',
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -5,
                        left: '50%',
                        width: hoveredCategory === category ? '40%' : '0%',
                        height: '2px',
                        backgroundColor: 'primary.main',
                        transform: 'translateX(-50%)',
                        transition: 'width 0.2s ease'
                    }
                }}
            >
                {category.name}
            </Typography>

            {/* Dropdown Panel */}
            {hoveredCategory === category && (
                <Paper
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        minWidth: '220px',
                        backgroundColor: 'white',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                        borderRadius: '6px',
                        animation: 'fadeIn 0.25s ease-in-out',
                        zIndex: 1300,
                        '@keyframes fadeIn': {
                            from: {
                                opacity: 0,
                                transform: 'translateY(-8px)'
                            },
                            to: {
                                opacity: 1,
                                transform: 'translateY(0)'
                            }
                        }
                    }}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                            {category.name}
                        </Typography>
                        <Divider sx={{ mb: 1 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                {category.subcategories && category.subcategories.length > 0 ? (
                                    // Map through subcategories
                                    category.subcategories.map((subcat, index) => (
                                        <MenuItem
                                            key={index}
                                            onClick={() => handleSubcategoryClick(category, subcat)}
                                            sx={{
                                                py: 1,
                                                borderRadius: '4px',
                                                transition: 'all 0.15s ease',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                                                    color: 'primary.main',
                                                    transform: 'translateX(3px)'
                                                }
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {typeof subcat === 'string' ? subcat : subcat.name}
                                            </Typography>
                                        </MenuItem>
                                    ))
                                ) : (
                                    // Show a "Browse All" option if no subcategories
                                    <MenuItem
                                        onClick={() => navigate(`/products?category=${category.id || category.name.toLowerCase()}&expandFilters=true`)}
                                        sx={{
                                            py: 1,
                                            borderRadius: '4px',
                                            transition: 'all 0.15s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(25, 118, 210, 0.05)',
                                                color: 'primary.main',
                                                transform: 'translateX(3px)'
                                            }
                                        }}
                                    >
                                        <Typography variant="body2">
                                            Browse All
                                        </Typography>
                                    </MenuItem>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            )}
        </Box>
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const toggleDrawer = (open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleCategoryClick = (category) => {
        if (expandedCategory === category) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(category);
        }
    };

    // Modified navigation function for products page
    const handleNavigateToProducts = (category, subcategory) => {
        if (subcategory) {
            // Navigate with specific subcategory
            navigate(`/products?category=${subcategory.id || subcategory}&expandFilters=true`);
        } else if (category) {
            // Navigate with just the category
            navigate(`/products?category=${category.id || category.name.toLowerCase()}&expandFilters=true`);
        } else {
            // Navigate to all products if no category specified
            navigate('/products');
        }
        setDrawerOpen(false);
    };

    const drawer = (
        <Box sx={{ width: { xs: 250, sm: 280 } }} role="presentation" onKeyDown={toggleDrawer(false)}>
            {/* Header with Logo and Name */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2.5,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    backgroundColor: 'rgba(0, 0, 0, 0.01)',
                    cursor: 'pointer',
                }}
                onClick={() => { navigate('/'); setDrawerOpen(false); }}
            >
                <img
                    src="/logo.png"
                    alt="Logo"
                    style={{
                        height: 40,
                        width: 'auto',
                        marginRight: 12,
                        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))'
                    }}
                />
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    STRIVE
                </Typography>
            </Box>

            {/* Categories Section - Improved spacing for touch */}
            <List sx={{ pt: 1, pb: 1 }}>
                {categories.map((category) => (
                    <React.Fragment key={category.name}>
                        <ListItem
                            button
                            onClick={() => handleNavigateToProducts(category)}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                px: 2.5,
                                py: { xs: 1.8, sm: 1.5 }, // More padding on smaller screens for better touch targets
                                mb: 0.5,
                                transition: 'all 0.15s ease',
                                borderRadius: '0 24px 24px 0',
                                '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                                    paddingLeft: 3.5
                                }
                            }}
                        >
                            <ListItemText
                                primary={category.name}
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        fontSize: { xs: '0.9rem', sm: '0.95rem' },
                                        fontWeight: 500,
                                    }
                                }}
                            />
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCategoryClick(category.name);
                                }}
                                size="small"
                                sx={{
                                    transition: 'transform 0.2s ease',
                                    transform: expandedCategory === category.name ? 'rotate(180deg)' : 'rotate(0deg)',
                                    padding: { xs: '8px', sm: '4px' }, // Larger touch target on mobile
                                }}
                            >
                                <ExpandMoreIcon />
                            </IconButton>
                        </ListItem>
                        <Collapse in={expandedCategory === category.name} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {category.subcategories && category.subcategories.length > 0 ? (
                                    category.subcategories.map((subcategory, idx) => (
                                        <ListItem
                                            button
                                            key={idx}
                                            sx={{
                                                pl: 4.5,
                                                py: { xs: 1.5, sm: 1.2 }, // Improved touch targets
                                                backgroundColor: 'rgba(0, 0, 0, 0.01)',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                                                    pl: 5.5
                                                }
                                            }}
                                            onClick={() => handleNavigateToProducts(category, subcategory)}
                                        >
                                            <ListItemText
                                                primary={typeof subcategory === 'string' ? subcategory : subcategory.name}
                                                sx={{
                                                    '& .MuiListItemText-primary': {
                                                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                                    }
                                                }}
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem
                                        button
                                        sx={{
                                            pl: 4.5,
                                            py: { xs: 1.5, sm: 1.2 },
                                            backgroundColor: 'rgba(0, 0, 0, 0.01)',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(25, 118, 210, 0.05)',
                                                pl: 5.5
                                            }
                                        }}
                                        onClick={() => handleNavigateToProducts(category)}
                                    >
                                        <ListItemText
                                            primary="Browse All"
                                            sx={{
                                                '& .MuiListItemText-primary': {
                                                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                                }
                                            }}
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </Collapse>
                    </React.Fragment>
                ))}
            </List>

            <Divider />

            {/* Account Section */}
            {user && (
                <List>
                    <Typography
                        variant="overline"
                        sx={{
                            px: 2,
                            py: 1,
                            display: 'block',
                            color: 'text.secondary',
                            fontWeight: 500,
                        }}
                    >
                        Account
                    </Typography>
                    {user.role && user.role.toUpperCase() === 'ADMIN' && (
                        <ListItem
                            button
                            onClick={() => { navigate('/admin'); setDrawerOpen(false); }}
                            sx={{
                                px: 2,
                                py: { xs: 1.5, sm: 1.2 } // Larger touch targets
                            }}
                        >
                            <ListItemIcon>
                                <AdminPanelSettingsIcon sx={{ color: 'primary.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Admin Dashboard" />
                        </ListItem>
                    )}
                    <ListItem
                        button
                        onClick={() => { logout(); navigate('/'); setDrawerOpen(false); }}
                        sx={{
                            px: 2,
                            py: { xs: 1.5, sm: 1.2 } // Larger touch targets
                        }}
                    >
                        <ListItemIcon>
                            <LogoutIcon sx={{ color: 'error.main' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Logout"
                            sx={{
                                '& .MuiListItemText-primary': {
                                    color: 'error.main',
                                }
                            }}
                        />
                    </ListItem>
                </List>
            )}
        </Box>
    );

    const renderSearchExpanded = () => (
        <Fade in={searchExpanded} timeout={300}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                backgroundColor: 'white',
                p: 0,
                zIndex: 1200,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                height: 'auto',
                maxHeight: { xs: '90vh', sm: '80vh' }, // Larger on mobile
                overflow: 'auto',
                transform: searchExpanded ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform 0.3s ease-in-out',
            }}>
                {/* Search input and buttons */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    px: { xs: 1.5, sm: 2, md: 4 }, // Adjusted padding for different screen sizes
                    py: { xs: 1.2, sm: 1.5 },
                    backgroundColor: '#f8f8f8',
                    opacity: searchExpanded ? 1 : 0,
                    transform: searchExpanded ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'all 0.3s ease-in-out',
                }}>
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: '1.3rem', mr: 1.5 }} />
                    <TextField
                        autoFocus
                        fullWidth
                        variant="standard"
                        placeholder="Search for products..."
                        value={searchValue}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                        InputProps={{
                            disableUnderline: true,
                            sx: {
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                fontWeight: 400,
                                padding: { xs: '4px 0', sm: '6px 0' },
                            }
                        }}
                    />
                    <IconButton
                        color="inherit"
                        onClick={handleSearchClose}
                        sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            },
                            ml: 1,
                            padding: { xs: '6px', sm: '8px' }, // Larger touch target on mobile
                        }}
                    >
                        <CloseIcon fontSize={isExtraSmall ? 'small' : 'medium'} />
                    </IconButton>
                </Box>

                {/* Search history and popular searches with improved layout */}
                <Box sx={{
                    mt: 0,
                    p: { xs: 1.5, sm: 2, md: 4 }, // Progressive padding based on screen size
                    pt: { xs: 2, sm: 3 },
                    opacity: searchExpanded ? 1 : 0,
                    transform: searchExpanded ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.3s ease-in-out 0.1s',
                }}>
                    {searchHistory.length > 0 && (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                    Search History
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={clearSearchHistory}
                                    sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.8rem' }}
                                >
                                    Clear All
                                </Button>
                            </Box>
                            <Box sx={{ mb: 3 }}>
                                {searchHistory.map((term) => (
                                    <Box
                                        key={term}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            py: 1.2,
                                            cursor: 'pointer',
                                            borderRadius: '8px',
                                            px: 1.5,
                                            transition: 'background-color 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5'
                                            }
                                        }}
                                        onClick={() => handleHistoryItemClick(term)}
                                    >
                                        <HistoryIcon sx={{ color: 'text.secondary', mr: 2, fontSize: '1.1rem' }} />
                                        <Typography sx={{ flexGrow: 1, fontSize: '0.9rem' }}>{term}</Typography>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => removeHistoryItem(e, term)}
                                            sx={{
                                                color: 'text.secondary',
                                                opacity: 0.5,
                                                transition: 'opacity 0.2s ease',
                                                '&:hover': {
                                                    opacity: 1,
                                                    backgroundColor: 'rgba(0, 0, 0, 0.05)'
                                                }
                                            }}
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                            <Divider sx={{ my: 2 }} />
                        </>
                    )}

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontSize: '0.95rem' }}>
                        Popular Searches
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                    }}>
                        {popularSearches.map((term, index) => (
                            <Button
                                key={term}
                                variant="outlined"
                                size="small"
                                onClick={() => handlePopularSearchClick(term)}
                                sx={{
                                    borderRadius: '20px',
                                    textTransform: 'none',
                                    backgroundColor: '#f5f5f5',
                                    borderColor: '#e0e0e0',
                                    color: 'text.primary',
                                    px: 2,
                                    transition: 'all 0.2s ease',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    animation: `fadeIn 0.3s ease forwards ${index * 0.1}s`,
                                    '@keyframes fadeIn': {
                                        from: {
                                            opacity: 0,
                                            transform: 'translateY(10px)',
                                        },
                                        to: {
                                            opacity: 1,
                                            transform: 'translateY(0)',
                                        },
                                    },
                                    '&:hover': {
                                        backgroundColor: '#e0e0e0',
                                        borderColor: '#d0d0d0',
                                        transform: 'scale(1.05)',
                                    }
                                }}
                            >
                                {term}
                            </Button>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Fade>
    );

    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/manager')) {
        return null;
    }

    return (
        <AppBar position="fixed" color="default" elevation={1} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <ClickAwayListener onClickAway={() => searchExpanded && handleSearchClose()}>
                <Box>
                    <Toolbar
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            px: { xs: 1, sm: 2, md: 4 }, // Progressive padding based on screen size
                            py: { xs: 0.5, md: 0 }, // Slight padding on small screens
                            minHeight: { xs: '56px', sm: '64px' }, // Reduced height on mobile
                            transition: 'all 0.3s ease',
                            position: 'relative',
                        }}
                    >
                        {searchExpanded && renderSearchExpanded()}
                        <Box sx={{
                            display: 'flex',
                            width: '100%',
                            visibility: searchExpanded ? 'hidden' : 'visible',
                            justifyContent: 'space-between'
                        }}>

                            {isMobile ? (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <IconButton
                                            edge="start"
                                            color="inherit"
                                            onClick={toggleDrawer(true)}
                                            sx={{
                                                p: { xs: 0.5, sm: 1 }
                                            }}
                                        >
                                            <MenuIcon fontSize={isExtraSmall ? 'medium' : 'large'} />
                                        </IconButton>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => navigate('/')}
                                        >
                                            <img
                                                src="/logo.png"
                                                alt="Logo"
                                                style={{
                                                    height: isExtraSmall ? 30 : 35,
                                                    marginRight: isExtraSmall ? 4 : 8
                                                }}
                                            />
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    fontFamily: '"Montserrat", sans-serif',
                                                    fontWeight: 700,
                                                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                                    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    display: { xs: 'none', sm: 'block' }, // Hide text on extra small screens
                                                }}
                                            >
                                                STRIVE
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <SwipeableDrawer
                                        anchor="left"
                                        open={drawerOpen}
                                        onClose={toggleDrawer(false)}
                                        onOpen={toggleDrawer(true)}
                                        disableBackdropTransition={!isExtraSmall}
                                        disableDiscovery={isExtraSmall}
                                    >
                                        {drawer}
                                    </SwipeableDrawer>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                                        <IconButton
                                            color="inherit"
                                            onClick={handleSearchClick}
                                            sx={{ p: { xs: 0.5, sm: 1 } }}
                                        >
                                            <SearchIcon fontSize={isExtraSmall ? 'small' : 'medium'} />
                                        </IconButton>
                                        <IconButton
                                            color="inherit"
                                            onClick={() => navigate('/favorites')}
                                            sx={{ p: { xs: 0.5, sm: 1 } }}
                                        >
                                            <FavoriteBorderIcon fontSize={isExtraSmall ? 'small' : 'medium'} />
                                        </IconButton>
                                        <IconButton
                                            color="inherit"
                                            onClick={() => navigate('/cart')}
                                            sx={{ p: { xs: 0.5, sm: 1 } }}
                                        >
                                            <Badge
                                                badgeContent={cartItemsCount}
                                                color="primary"
                                                sx={{
                                                    '& .MuiBadge-badge': {
                                                        right: -3,
                                                        top: 3,
                                                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                        border: '2px solid white',
                                                        padding: '0 4px',
                                                    }
                                                }}
                                            >
                                                <ShoppingCartIcon fontSize={isExtraSmall ? 'small' : 'medium'} />
                                            </Badge>
                                        </IconButton>
                                        <IconButton
                                            color="inherit"
                                            onClick={handleProfileMenuOpen}
                                            sx={{ p: { xs: 0.5, sm: 1 } }}
                                        >
                                            <AccountCircleIcon fontSize={isExtraSmall ? 'small' : 'medium'} />
                                        </IconButton>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '20%' }}>
                                        <IconButton
                                            edge="start"
                                            color="inherit"
                                            onClick={() => navigate('/')}
                                            sx={{
                                                p: 0.5,
                                                '&:hover': {
                                                    backgroundColor: 'transparent',
                                                    '& img': {
                                                        transform: 'scale(1.05)',
                                                        filter: 'brightness(1.15)'
                                                    }
                                                }
                                            }}
                                        >
                                            <img
                                                src="/logo.png"
                                                alt="Logo"
                                                style={{
                                                    height: 45,
                                                    width: 'auto',
                                                    filter: 'brightness(1.1)',
                                                    transition: 'all 0.3s ease',
                                                }}
                                            />
                                        </IconButton>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                ml: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="h5"
                                                component="div"
                                                sx={{
                                                    cursor: 'pointer',
                                                    fontFamily: '"Montserrat", sans-serif',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.15em',
                                                    color: 'primary.main',
                                                    textTransform: 'uppercase',
                                                    lineHeight: 1,
                                                    fontSize: '1.5rem',
                                                    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)',
                                                        background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                    },
                                                }}
                                                onClick={() => navigate('/')}
                                            >
                                                STRIVE
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'text.secondary',
                                                    letterSpacing: '0.1em',
                                                    fontSize: '0.7rem',
                                                    fontFamily: '"Roboto", sans-serif',
                                                    opacity: 0.8,
                                                    mt: -0.5,
                                                }}
                                            >
                                                SPORTS & LIFESTYLE
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '60%', gap: 4 }}>
                                        {categories.map((category) => (
                                            <Button
                                                key={category.name}
                                                color="inherit"
                                                onMouseEnter={() => handleMouseEnter(category)}
                                                onMouseLeave={handleMouseLeave}
                                                onClick={() => navigate(`/products?category=${category.id || category.name.toLowerCase()}&expandFilters=true`)}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    fontSize: '0.95rem',
                                                    p: 1.2,
                                                    px: 2.5,
                                                    borderRadius: '8px',
                                                    transition: 'all 0.25s ease',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    color: hoveredCategory === category ? 'primary.main' : 'text.primary',
                                                    '&::after': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: '50%',
                                                        width: hoveredCategory === category ? '80%' : '0%',
                                                        height: '2px',
                                                        backgroundColor: 'primary.main',
                                                        transform: 'translateX(-50%)',
                                                        transition: 'width 0.3s ease'
                                                    },
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.04)'
                                                    },
                                                }}
                                            >
                                                {category.name}
                                            </Button>
                                        ))}
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '20%', justifyContent: 'flex-end' }}>
                                        <IconButton
                                            color="inherit"
                                            onClick={handleSearchClick}
                                            sx={{
                                                backgroundColor: '#f0f0f0',
                                                borderRadius: '20px',
                                                width: '200px',
                                                justifyContent: 'flex-start',
                                                pl: 2,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: '#e8e8e8',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                                },
                                                border: '1px solid #e0e0e0',
                                            }}
                                        >
                                            <SearchIcon sx={{ color: 'text.secondary' }} />
                                            <Typography
                                                sx={{
                                                    ml: 1,
                                                    color: 'text.secondary',
                                                    flexGrow: 1,
                                                    textAlign: 'left'
                                                }}
                                            >
                                                Search
                                            </Typography>
                                        </IconButton>
                                        <IconButton
                                            color="inherit"
                                            onClick={() => navigate('/favorites')}
                                            sx={{
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0,0,0,0.04)',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            <FavoriteBorderIcon />
                                        </IconButton>
                                        <IconButton color="inherit" onClick={() => navigate('/cart')}>
                                            <Badge
                                                badgeContent={cartItemsCount}
                                                color="primary"
                                                sx={{
                                                    '& .MuiBadge-badge': {
                                                        right: -3,
                                                        top: 3,
                                                        border: '2px solid white',
                                                        padding: '0 4px',
                                                    }
                                                }}
                                            >
                                                <ShoppingCartIcon />
                                            </Badge>
                                        </IconButton>
                                        <IconButton
                                            color="inherit"
                                            onClick={handleProfileMenuOpen}
                                            sx={{ ml: 0 }}
                                        >
                                            <AccountCircleIcon />
                                        </IconButton>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Toolbar>

                    {/* Full-width dropdown menu - Enhanced version */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            width: '100%',
                            zIndex: 1000,
                            overflow: 'hidden',
                        }}
                    >
                        <Paper
                            elevation={4}
                            onMouseEnter={handleDropdownMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            sx={{
                                backgroundColor: '#f8f9fc',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                py: 3.5,
                                px: 6,
                                borderTop: '1px solid rgba(0,0,0,0.05)',
                                borderRadius: '0 0 12px 12px',
                                transform: hoveredCategory ? 'translateY(0)' : 'translateY(-100%)',
                                transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                opacity: hoveredCategory ? 1 : 0,
                            }}
                        >
                            <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
                                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 700, 
                                            color: 'primary.main',
                                            position: 'relative',
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                bottom: -5,
                                                left: 0,
                                                width: '40px',
                                                height: '3px',
                                                backgroundColor: 'primary.main',
                                                borderRadius: '2px'
                                            }
                                        }}
                                    >
                                        {hoveredCategory?.name}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => navigate(`/products?category=${hoveredCategory?.id || hoveredCategory?.name?.toLowerCase()}&expandFilters=true`)}
                                        sx={{
                                            ml: 'auto',
                                            textTransform: 'none',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            px: 2,
                                            fontWeight: 500
                                        }}
                                    >
                                        View All
                                    </Button>
                                </Box>
                                
                                <Grid
                                    container
                                    spacing={3}
                                    sx={{ mt: 1 }}
                                >
                                    {hoveredCategory && hoveredCategory.subcategories && hoveredCategory.subcategories.length > 0 ? (
                                        // Map through subcategories with improved grid layout
                                        hoveredCategory.subcategories.map((subcategory, idx) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                                                <Box
                                                    sx={{
                                                        cursor: 'pointer',
                                                        py: 1.5,
                                                        px: 2,
                                                        borderRadius: '8px',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        border: '1px solid transparent',
                                                        backgroundColor: 'white',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                                        '&:hover': {
                                                            backgroundColor: 'white',
                                                            transform: 'translateX(4px)',
                                                            borderColor: 'rgba(25, 118, 210, 0.1)',
                                                            boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                                                        },
                                                    }}
                                                    onClick={() => handleSubcategoryClick(hoveredCategory, subcategory)}
                                                >
                                                    <Box 
                                                        sx={{ 
                                                            width: 6, 
                                                            height: 6, 
                                                            backgroundColor: 'primary.main', 
                                                            borderRadius: '50%',
                                                            mr: 1.5,
                                                            opacity: 0.7
                                                        }} 
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 500,
                                                            color: 'text.primary',
                                                            transition: 'color 0.15s ease',
                                                            '&:hover': {
                                                                color: 'primary.main',
                                                            },
                                                        }}
                                                    >
                                                        {typeof subcategory === 'string' ? subcategory : subcategory.name}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        ))
                                    ) : (
                                        // Show "Browse All" option if no subcategories
                                        <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                                                No subcategories available for {hoveredCategory?.name}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => navigate(`/products?category=${hoveredCategory?.id || hoveredCategory?.name?.toLowerCase()}&expandFilters=true`)}
                                                sx={{
                                                    borderRadius: '24px',
                                                    textTransform: 'none',
                                                    px: 3,
                                                    py: 1
                                                }}
                                            >
                                                Browse All Products
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </Paper>
                    </Box>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleProfileMenuClose}
                        onClick={handleProfileMenuClose}
                        PaperProps={{
                            elevation: 3,
                            sx: {
                                mt: 1,
                                minWidth: 220,
                                borderRadius: '8px',
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 8,
                                    height: 8,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        {user ? (
                            <>
                                <Box sx={{
                                    px: 2, // Reduced padding
                                    py: 1.5,
                                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                    borderTopLeftRadius: '8px',
                                    borderTopRightRadius: '8px',
                                }}>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: 'block', mb: 0.5 }}
                                    >
                                        Signed in as
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 500,
                                            color: 'text.primary',
                                        }}
                                    >
                                        {user.email}
                                    </Typography>
                                </Box>
                                <Box sx={{ py: 0.5 }}>
                                    <MenuItem
                                        onClick={() => navigate('/profile')}
                                        sx={{
                                            py: 1,
                                            px: 2,
                                            '&:hover': {
                                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                            },
                                        }}
                                    >
                                        <ListItemIcon>
                                            <AccountCircleIcon
                                                fontSize="small"
                                                sx={{
                                                    color: 'primary.main',
                                                    width: 20,
                                                    height: 20,
                                                }}
                                            />
                                        </ListItemIcon>
                                        <Typography variant="body2">
                                            Profile
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => navigate('/orders')}
                                        sx={{
                                            py: 1,
                                            px: 2,
                                            '&:hover': {
                                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                            },
                                        }}
                                    >
                                        <ListItemIcon>
                                            <ShoppingBag
                                                fontSize="small"
                                                sx={{
                                                    color: 'primary.main',
                                                    width: 20,
                                                    height: 20,
                                                }}
                                            />
                                        </ListItemIcon>
                                        <Typography variant="body2">
                                            My Orders
                                        </Typography>
                                    </MenuItem>
                                    {user.role && user.role.toUpperCase() === 'ADMIN' && (
                                        <MenuItem
                                            onClick={() => navigate('/admin')}
                                            sx={{
                                                py: 1,
                                                px: 2,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                                },
                                            }}
                                        >
                                            <ListItemIcon>
                                                <AdminPanelSettingsIcon
                                                    fontSize="small"
                                                    sx={{
                                                        color: 'primary.main',
                                                        width: 20,
                                                        height: 20,
                                                    }}
                                                />
                                            </ListItemIcon>
                                            <Typography variant="body2">
                                                Admin Dashboard
                                            </Typography>
                                        </MenuItem>
                                    )}
                                    {user.role && user.role.toUpperCase() === 'MANAGER' && (
                                        <MenuItem
                                            onClick={() => navigate('/manager')}
                                            sx={{
                                                py: 1,
                                                px: 2,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                                },
                                            }}
                                        >
                                            <ListItemIcon>
                                                <AdminPanelSettingsIcon
                                                    fontSize="small"
                                                    sx={{
                                                        color: 'primary.main',
                                                        width: 20,
                                                        height: 20,
                                                    }}
                                                />
                                            </ListItemIcon>
                                            <Typography variant="body2">
                                                Manager Dashboard
                                            </Typography>
                                        </MenuItem>
                                    )}
                                </Box>
                                <Divider sx={{ my: 0.5 }} />
                                <Box sx={{ py: 0.5 }}>
                                    <MenuItem
                                        onClick={() => {
                                            logout();
                                            navigate('/');
                                            handleProfileMenuClose();
                                        }}
                                        sx={{
                                            py: 1,
                                            px: 2,
                                            '&:hover': {
                                                backgroundColor: 'rgba(211, 47, 47, 0.04)',
                                            },
                                        }}
                                    >
                                        <ListItemIcon>
                                            <LogoutIcon
                                                fontSize="small"
                                                sx={{
                                                    color: 'error.main',
                                                    width: 20,
                                                    height: 20,
                                                }}
                                            />
                                        </ListItemIcon>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: 'error.main' }}
                                        >
                                            Logout
                                        </Typography>
                                    </MenuItem>
                                </Box>
                            </>
                        ) : (
                            <MenuItem
                                onClick={() => navigate('/login')}
                                sx={{
                                    py: 1,
                                    px: 2,
                                    '&:hover': {
                                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <LoginIcon
                                        fontSize="small"
                                        sx={{
                                            color: 'primary.main',
                                            width: 20,
                                            height: 20,
                                        }}
                                    />
                                </ListItemIcon>
                                <Typography variant="body2">
                                    Login
                                </Typography>
                            </MenuItem>
                        )}
                    </Menu>
                </Box>
            </ClickAwayListener>
        </AppBar>
    );
};

export default Header;