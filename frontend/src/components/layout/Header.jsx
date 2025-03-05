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
    useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {useLocation, useNavigate} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '@mui/material';
import { useCart } from '../../context/CartContext';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
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
    const isMobile = useMediaQuery('(max-width:600px)');
    const cartItemsCount = cartItems.length;

    const categories = [
        { name: 'New', path: '/new' },
        { name: 'Men', path: '/men' },
        { name: 'Women', path: '/women' },
        { name: 'Sports', path: '/sports' }
    ];

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
            if (!searchHistory.includes(searchValue.trim())) {
                setSearchHistory(prev => [searchValue.trim(), ...prev.slice(0, 4)]);
            } else {
                setSearchHistory(prev => [
                    searchValue.trim(),
                    ...prev.filter(item => item !== searchValue.trim())
                ]);
            }
            navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
            handleSearchClose();
        }
    }, [searchValue, searchHistory, navigate]);

    const handlePopularSearchClick = (term) => {
        setSearchValue(term);

        // Execute search immediately with the selected term
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
            navigate(`/search?q=${encodeURIComponent(trimmedTerm)}`);
            handleSearchClose();
        }
    };

    const handleHistoryItemClick = (term) => {
        // No longer just sets the search value
        // Instead directly navigates to search results
        const trimmedTerm = term.trim();
        if (trimmedTerm) {
            // Move this term to top of history
            setSearchHistory(prev => [
                trimmedTerm,
                ...prev.filter(item => item !== trimmedTerm)
            ]);
            navigate(`/search?q=${encodeURIComponent(trimmedTerm)}`);
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

    const drawer = (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                {categories.map((category) => (
                    <ListItem button key={category.name} onClick={() => navigate(category.path)}>
                        <ListItemText primary={category.name} />
                    </ListItem>
                ))}
                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <ListItem button onClick={() => navigate('/admin')}>
                                <ListItemText primary="Admin" />
                            </ListItem>
                        )}
                        <ListItem button onClick={() => { logout(); navigate('/'); }}>
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </>
                ) : (
                    <ListItem button onClick={() => navigate('/login')}>
                        <ListItemText primary="Login" />
                    </ListItem>
                )}
            </List>
        </Box>
    );

    // Render search expanded UI - now extracted to a separate component for reuse
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
                zIndex: 10,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                height: 'auto',
                maxHeight: '80vh',
                overflow: 'auto',
                transform: searchExpanded ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform 0.3s ease-in-out',
            }}>
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
                    <IconButton
                        onClick={handleSearchClose}
                        sx={{
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                                transform: 'rotate(90deg)',
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

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

    if (location.pathname.startsWith('/admin')) {
        return null;
    }


    return (
        <AppBar position="fixed" color="default" elevation={1} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <ClickAwayListener onClickAway={() => searchExpanded && handleSearchClose()}>
                <Toolbar sx={{ justifyContent: 'space-between', width: '100%', px: isMobile ? 2 : 4, transition: 'all 0.3s ease' }}>
                    {searchExpanded ? (
                        renderSearchExpanded()
                    ) : (
                        <>
                            {isMobile ? (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)}>
                                            <MenuIcon />
                                        </IconButton>
                                        <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
                                            <img src="/logo192.png" alt="Logo" style={{ height: 40 }} />
                                        </IconButton>
                                    </Box>
                                    <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                                        {drawer}
                                    </Drawer>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton
                                            color="inherit"
                                            onClick={handleSearchClick}
                                            sx={{ mr: 1 }}
                                        >
                                            <SearchIcon />
                                        </IconButton>
                                        <IconButton
                                            color="inherit"
                                            onClick={() => navigate('/cart')}
                                            sx={{ mr: 1 }}
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
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '20%' }}>
                                        <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
                                            <img src="/logo192.png" alt="Logo" style={{ height: 40 }} />
                                        </IconButton>
                                        <Typography variant="h6" component="div" sx={{ ml: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
                                            Sports Store
                                        </Typography>
                                    </Box>

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
                                        {user ? (
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
                                        ) : (
                                            <Button
                                                color="inherit"
                                                onClick={() => navigate('/login')}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Login
                                            </Button>
                                        )}
                                    </Box>
                                </>
                            )}
                        </>
                    )}
                </Toolbar>
            </ClickAwayListener>
        </AppBar>
    );
};

export default Header;



