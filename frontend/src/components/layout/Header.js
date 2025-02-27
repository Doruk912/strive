import React from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
    TextField,
    InputAdornment,
    Button,
    Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();

    const categories = [
        { name: 'New', path: '/new' },
        { name: 'Men', path: '/men' },
        { name: 'Women', path: '/women' },
        { name: 'Sports', path: '/sports' }
    ];

    return (
        <AppBar position="fixed" color="default" elevation={1} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Toolbar sx={{ justifyContent: 'space-between', width: '100%', px: 4 }}>
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

                {/* Right section: Search, Favorites, Cart, Login */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '20%', justifyContent: 'flex-end' }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search"
                        size="small"
                        sx={{
                            width: '200px',
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#f0f0f0',
                                borderRadius: '20px',
                                border: '1px solid #e0e0e0',
                                '&:hover': {
                                    backgroundColor: '#e8e8e8',
                                    '& fieldset': {
                                        borderColor: '#bdbdbd',
                                    },
                                },
                                '&.Mui-focused': {
                                    backgroundColor: '#ffffff',
                                    '& fieldset': {
                                        borderColor: '#9e9e9e',
                                    },
                                },
                                '& fieldset': {
                                    borderColor: '#e0e0e0',
                                },
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <IconButton color="inherit" onClick={() => navigate('/favorites')}>
                        <FavoriteBorderIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={() => navigate('/cart')}>
                        <ShoppingCartIcon />
                    </IconButton>
                    <Button
                        color="inherit"
                        onClick={() => navigate('/login')}
                        sx={{ textTransform: 'none' }}
                    >
                        Login
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;