import React from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
    TextField,
    InputAdornment,
    Container,
    Button,
    Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();

    return (
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Container maxWidth="lg">
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
                        <img src="/logo192.png" alt="Logo" style={{ height: 40 }} />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ ml: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
                        Sports Store
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                        <TextField
                            variant="outlined"
                            placeholder="Search"
                            size="small"
                            sx={{
                                backgroundColor: '#f5f5f5',
                                borderRadius: '20px',
                                width: '300px',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'transparent',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#ccc',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#ccc',
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
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            </Container>
        </AppBar>
    );
};

export default Header;