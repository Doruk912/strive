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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
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
    };

    const handleHistoryItemClick = (term) => {
        setSearchValue(term);
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
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
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

    return (
        <AppBar position="fixed" color="default" elevation={1} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <ClickAwayListener onClickAway={() => searchExpanded && handleSearchClose()}>
                <Toolbar sx={{ justifyContent: 'space-between', width: '100%', px: 4, transition: 'all 0.3s ease' }}>
                    {isMobile ? (
                        <>
                            <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)}>
                                <MenuIcon />
                            </IconButton>
                            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                                {drawer}
                            </Drawer>
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
                                    <ShoppingCartIcon />
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
                </Toolbar>
            </ClickAwayListener>
        </AppBar>
    );
};

export default Header; 




