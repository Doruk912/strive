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

    return (
        <AppBar position="fixed" color="default" elevation={1} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <ClickAwayListener onClickAway={() => searchExpanded && handleSearchClose()}>
                <Toolbar sx={{ justifyContent: 'space-between', width: '100%', px: 4, transition: 'all 0.3s ease' }}>
                    {searchExpanded ? (
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
                            overflow: 'auto'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', px: 2 }}>
                                <SearchIcon
                                    sx={{ color: 'text.secondary', mr: 1, cursor: 'pointer' }}
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
                                        }
                                    }}
                                />
                                <IconButton onClick={handleSearchClose}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            <Box sx={{ mt: 3, px: 2 }}>
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
                                                        sx={{ color: 'text.secondary' }}
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
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {popularSearches.map((term) => (
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
                                                '&:hover': {
                                                    backgroundColor: '#e0e0e0',
                                                    borderColor: '#d0d0d0',
                                                }
                                            }}
                                        >
                                            {term}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
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