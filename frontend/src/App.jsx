import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import { Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './App.css';
import AdminLayout from "./components/layout/AdminLayout";
import Categories from "./pages/AdminCategories";
import AdminProducts from "./pages/AdminProducts";
import AdminFeaturedProducts from "./pages/AdminFeaturedProducts";
import { FavoritesProvider } from './context/FavoritesContext';
import Favorites from './pages/Favorites';
import FeaturedCategories from './pages/AdminFeaturedCategories';

function ScrollToTop() {
    const { pathname } = useLocation();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

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

function AppContent() {
    const ProtectedRoute = ({ children }) => {
        const { user } = useAuth();
        const location = useLocation();

        if (!user || user.role !== 'admin') {
            return <Navigate to="/" state={{ from: location }} replace />;
        }

        return children;
    };
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ScrollToTop />
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
                        <Route path="/favorites" element={<Favorites />} />

                        <Route path="/admin" element={
                            <ProtectedRoute>
                                <AdminLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="/admin/products" replace />} />
                            <Route path="products" element={<AdminProducts />} />
                            <Route path="featured" element={<AdminFeaturedProducts />} />
                            <Route path="categories" element={<Categories />} />
                            <Route path="featured-categories" element={<FeaturedCategories />} />
                        </Route>
                    </Routes>
                </Box>
                <Footer />
            </Box>
        </ThemeProvider>
    );
}

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <FavoritesProvider>
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                </FavoritesProvider>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;