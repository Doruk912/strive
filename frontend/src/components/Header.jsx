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
    Paper,
    Grid,
    Badge,
    Collapse,
    MenuItem,
    ListItemIcon,
    Menu,
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
    const isMobile = useMediaQuery('(max-width:600px)');
    const cartItemsCount = cartItems.length;

    // State for hover-based dropdown
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [hoverTimeout, setHoverTimeout] = useState(null);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const categories = [
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

    const handleNavigateToProducts = () => {
        navigate('/products');
        setDrawerOpen(false);
    };

    const drawer = (
        <Box sx={{ width: 250 }} role="presentation" onKeyDown={toggleDrawer(false)}>
            {/* Header with Logo and Name */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer', // Add cursor pointer
                }}
                onClick={() => { navigate('/'); setDrawerOpen(false); }} // Add click handler
            >
                <img
                    src="/logo.png"
                    alt="Logo"
                    style={{
                        height: 40,
                        width: 'auto',
                        marginRight: 12,
                    }}
                />
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    STRIVE
                </Typography>
            </Box>

            {/* Categories Section - removed the "Categories" text */}
            <List>
                {categories.map((category) => (
                    <React.Fragment key={category.name}>
                        <ListItem
                            button
                            onClick={() => handleNavigateToProducts()}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                px: 2,
                            }}
                        >
                            <ListItemText
                                primary={category.name}
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        fontSize: '0.95rem',
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
                            >
                                {expandedCategory === category.name ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </ListItem>
                        <Collapse in={expandedCategory === category.name} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {category.subcategories.map((subcategory) => (
                                    <ListItem
                                        button
                                        key={subcategory}
                                        sx={{
                                            pl: 4,
                                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                        }}
                                        onClick={handleNavigateToProducts}
                                    >
                                        <ListItemText
                                            primary={subcategory}
                                            sx={{
                                                '& .MuiListItemText-primary': {
                                                    fontSize: '0.9rem',
                                                }
                                            }}
                                        />
                                    </ListItem>
                                ))}
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
                            sx={{ px: 2 }}
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
                        sx={{ px: 2 }}
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
                p: 2,
                zIndex: 1200,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                height: 'auto',
                maxHeight: '80vh',
                overflow: 'auto',
                transform: searchExpanded ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform 0.3s ease-in-out',
            }}>
                {/* Search input and buttons */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    px: 2,
                    opacity: searchExpanded ? 1 : 0,
                    transform: searchExpanded ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'all 0.3s ease-in-out',
                }}>
                    <SearchIcon
                        sx={{
                            color: 'text.secondary',
                            mr: 1,
                            cursor: 'pointer',
                            transition: 'color 0.2s ease',
                            '&:hover': {
                                color: 'primary.main',
                            },
                        }}
                        onClick={handleSearch}
                    />
                    <TextField
                        autoFocus
                        fullWidth
                        variant="standard"
                        placeholder="Search"
                        value={searchValue}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                        InputProps={{
                            disableUnderline: true,
                        }}
                        sx={{
                            '& input': {
                                fontSize: '1.2rem',
                                py: 1.5,
                                transition: 'all 0.2s ease',
                            }
                        }}
                    />
                    <IconButton color="inherit" onClick={handleSearchClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Search history and popular searches */}
                <Box sx={{
                    mt: 3,
                    px: 2,
                    opacity: searchExpanded ? 1 : 0,
                    transform: searchExpanded ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.3s ease-in-out 0.1s',
                }}>
                    {searchHistory.length > 0 && (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    Search History
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={clearSearchHistory}
                                    sx={{ textTransform: 'none', color: 'text.secondary' }}
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
                                            py: 1,
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5'
                                            }
                                        }}
                                        onClick={() => handleHistoryItemClick(term)}
                                    >
                                        <HistoryIcon sx={{ color: 'text.secondary', mr: 2 }} />
                                        <Typography sx={{ flexGrow: 1 }}>{term}</Typography>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => removeHistoryItem(e, term)}
                                            sx={{
                                                color: 'text.secondary',
                                                opacity: 0.5,
                                                transition: 'opacity 0.2s ease',
                                                '&:hover': {
                                                    opacity: 1,
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

                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
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
                                    transition: 'all 0.2s ease',
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
                            px: isMobile ? 2 : 4,
                            transition: 'all 0.3s ease',
                            position: 'relative'
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)}>
                                            <MenuIcon />
                                        </IconButton>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => navigate('/')}
                                        >
                                            <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
                                                <img src="/logo.png" alt="Logo" style={{ height: 35 }} />
                                            </IconButton>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    fontFamily: '"Montserrat", sans-serif',
                                                    fontWeight: 700,
                                                    fontSize: '1.1rem',
                                                    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                }}
                                            >
                                                STRIVE
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                                        {drawer}
                                    </Drawer>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconButton
                                            color="inherit"
                                            onClick={handleSearchClick}
                                            sx={{ p: 1 }}
                                        >
                                            <SearchIcon />
                                        </IconButton>
                                        <IconButton
                                            color="inherit"
                                            onClick={() => navigate('/favorites')}
                                            sx={{ p: 1 }}
                                        >
                                            <FavoriteBorderIcon />
                                        </IconButton>
                                        <IconButton
                                            color="inherit"
                                            onClick={() => navigate('/cart')}
                                            sx={{ p: 1 }}
                                        >
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
                                            sx={{ p: 1 }}
                                        >
                                            <AccountCircleIcon />
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
                                                    p: 0.5, // Reduced padding
                                                    '&:hover': {
                                                        backgroundColor: 'transparent',
                                                    }
                                                }}
                                            >
                                                <img
                                                    src="/logo.png"
                                                    alt="Logo"
                                                    style={{
                                                        height: 45, // Slightly larger
                                                        width: 'auto',
                                                        filter: 'brightness(1.1)', // Makes the logo slightly brighter
                                                        transition: 'transform 0.3s ease',
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
                                                        fontFamily: '"Montserrat", sans-serif', // More modern font
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
                                                    onMouseEnter={() => handleMouseEnter(category.name)}
                                                    onMouseLeave={handleMouseLeave}
                                                    onClick={() => navigate(`/products?category=${category.name.toLowerCase()}`)} // Navigate to Products.jsx
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontWeight: 'medium',
                                                        fontSize: '1rem',
                                                        p: 1,
                                                        borderRadius: '4px',
                                                        transition: 'background-color 0.2s ease',
                                                        '&:hover': {
                                                            backgroundColor: '#f5f5f5',
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
                                                    '&:hover': {
                                                        backgroundColor: '#e8e8e8',
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
                                            <IconButton color="inherit" onClick={() => navigate('/favorites')}>
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

                    {/* Full-width dropdown menu */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            width: '100%',
                            zIndex: 1000,
                            overflow: 'hidden', // Hide overflow during animation
                        }}
                    >
                        <Paper
                            elevation={3}
                            onMouseEnter={handleDropdownMouseEnter} // Keep the dropdown open when hovered
                            onMouseLeave={handleMouseLeave} // Close the dropdown when the mouse leaves
                            sx={{
                                backgroundColor: 'white',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                p: 4,
                                transform: hoveredCategory ? 'translateY(0)' : 'translateY(-100%)', // Slide down or up
                                transition: 'transform 0.3s ease', // Smooth sliding animation
                            }}
                        >
                            <Grid
                                container
                                spacing={4}
                                justifyContent="center" // Center the grid horizontally
                            >
                                {categories
                                    .find((cat) => cat.name === hoveredCategory)
                                    ?.subcategories.map((subcategory) => (
                                        <Grid item xs={4} key={subcategory}> {/* 3 items per row (12/4 = 3) */}
                                            <Box
                                                sx={{
                                                    cursor: 'pointer',
                                                    p: 2,
                                                    borderRadius: '4px',
                                                    transition: 'background-color 0.2s ease',
                                                    textAlign: 'center', // Center the text
                                                    '&:hover': {
                                                        backgroundColor: '#f5f5f5',
                                                    },
                                                }}
                                                onClick={() => navigate(`/products?category=${hoveredCategory.toLowerCase()}&subcategory=${subcategory.toLowerCase().replace(/\s+/g, '-')}`)} // Navigate to Products.jsx
                                            >
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontWeight: 'medium',
                                                        color: 'text.primary',
                                                        '&:hover': {
                                                            color: 'primary.main',
                                                        },
                                                    }}
                                                >
                                                    {subcategory}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                            </Grid>
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