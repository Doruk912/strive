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
import AdminPromotionalBanner from "./pages/AdminPromotionalBanner";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import ManagerLayout from "./components/layout/ManagerLayout";
import EmployeeManagement from "./pages/ManagerEmployeeManagement";
import FinancialOverview from "./pages/ManagerFinancialOverview";

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

        if (!user) {
            return <Navigate to="/login" state={{ from: location }} replace />;
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
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/favorites" element={<Favorites />} />

                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />

                        <Route path="/checkout" element={
                            <ProtectedRoute>
                                <Checkout />
                            </ProtectedRoute>
                        } />
                        <Route path="/order-confirmation" element={
                            <ProtectedRoute>
                                <OrderConfirmation />
                            </ProtectedRoute>
                        } />

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
                            <Route path="promotional-banner" element={<AdminPromotionalBanner />} />
                        </Route>

                        <Route path="/manager" element={
                            <ProtectedRoute>
                                <ManagerLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="/manager/employees" replace />} />
                            <Route path="employees" element={<EmployeeManagement />} />
                            <Route path="finances" element={<FinancialOverview />} />
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