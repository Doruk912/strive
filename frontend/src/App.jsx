import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import { Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './App.css';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#f50057',
        },
    },
});

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '100vh'
                        }}>
                            <Header />
                            <Box sx={{ flex: 1, py: 3 }}>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/products" element={<Products />} />
                                    <Route path="/product/:id" element={<ProductDetail />} />
                                    <Route path="/cart" element={<Cart />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/admin" element={<Admin />} />
                                </Routes>
                            </Box>
                            <Footer />
                        </Box>
                    </ThemeProvider>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;