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
    Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Make sure this path is correct

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Add this line
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [searchHistory, setSearchHistory] = useState(() => {
        const savedHistory = localStorage.getItem('searchHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });
    const [popularSearches] = useState([
        'basketball', 'tech', 'air force', 'running shoes', 'dunk low', 'mont', 'sports gear'
    ]);

    const categories = [
        { name: 'New', path: '/new' },
        { name: 'Men', path: '/men' },
        { name: 'Women', path: '/women' },
        { name: 'Sports', path: '/sports' }
    ];

    // Save search history to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }, [searchHistory]);

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
            // Add the current search term to history (if not already present)
            if (!searchHistory.includes(searchValue.trim())) {
                // Add to beginning, limit to 5 items
                setSearchHistory(prev => [searchValue.trim(), ...prev.slice(0, 4)]);
            } else {
                // Move to top if already exists
                setSearchHistory(prev => [
                    searchValue.trim(),
                    ...prev.filter(item => item !== searchValue.trim())
                ]);
            }

            // Perform search (navigate to search results)
            navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
            handleSearchClose();
        }
    }, [searchValue, searchHistory, navigate]);

    const handlePopularSearchClick = (term) => {
        setSearchValue(term);
        // Option: Auto-search when clicking a popular term
        // setTimeout(() => handleSearch(), 0);
    };

    const handleHistoryItemClick = (term) => {
        setSearchValue(term);
        // Option: Auto-search when clicking a history item
        // setTimeout(() => handleSearch(), 0);
    };

    const removeHistoryItem = (event, term) => {
        event.stopPropagation();
        setSearchHistory(prev => prev.filter(item => item !== term));
    };

    const clearSearchHistory = () => {
        setSearchHistory([]);
    };

    // Keyboard event handler
    const handleKeyDown = useCallback((event) => {
        if (searchExpanded) {
            if (event.key === 'Escape') {
                handleSearchClose();
            } else if (event.key === 'Enter') {
                handleSearch();
            }
        }
    }, [searchExpanded, handleSearch]);

    // Add event listener for keyboard navigation
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const renderAuthButtons = () => {
        if (user) {
            return (
                <>
                    {user.role === 'admin' && (
                        <Button
                            color="inherit"
                            onClick={() => navigate('/admin')}
                            sx={{ textTransform: 'none' }}
                        >
                            Admin
                        </Button>
                    )}
                    <Button
                        color="inherit"
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                        sx={{ textTransform: 'none' }}
                    >
                        Logout
                    </Button>
                </>
            );
        }
        return (
            <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
            >
                Login
            </Button>
        );
    };

    return (
        <AppBar position="fixed" color="default" elevation={1} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <ClickAwayListener onClickAway={() => searchExpanded && handleSearchClose()}>
                <Toolbar sx={{ justifyContent: 'space-between', width: '100%', px: 4, transition: 'all 0.3s ease' }}>
                    {searchExpanded ? (
                        // ... keep your existing search expanded section ...
                        <Fade in={searchExpanded} timeout={300}>
                            {/* ... your existing search expanded content ... */}
                        </Fade>
                    ) : (
                        <>
                            {/* Left section: Logo and Store Name */}
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '20%' }}>
                                <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
                                    <img src="/logo192.png" alt="Logo" style={{ height: 40 }} />
                                </IconButton>
                                <Typography variant="h6" component="div" sx={{ ml: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
                                    Sports Store
                                </Typography>
                            </Box>

                            {/* Middle section: Categories */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', width: '60%' }}>
                                {categories.map((category) => (
                                    <Button
                                        key={category.name}
                                        color="inherit"
                                        onClick={() => navigate(category.path)}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 'medium',
                                            fontSize: '1rem',
                                            mx: 2
                                        }}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            </Box>

                            {/* Right section: Search, Favorites, Cart, Login/Admin */}
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
                                    <ShoppingCartIcon />
                                </IconButton>
                                {renderAuthButtons()}
                            </Box>
                        </>
                    )}
                </Toolbar>
            </ClickAwayListener>
        </AppBar>
    );
};

export default Header;