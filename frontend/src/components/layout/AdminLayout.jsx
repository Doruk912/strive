import React, { useState } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Button,
    useTheme,
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    Star as StarIcon,
    Category as CategoryIcon,
    ExitToApp as LogoutIcon,
    Menu as MenuIcon,
    CampaignOutlined as CampaignOutlinedIcon,
    FeaturedPlayListOutlined as FeaturedCategoriesIcon,
    Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 240;

const AdminLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleViewSite = () => {
        navigate('/');
    };

    const menuItems = [
        { text: 'Products', icon: <InventoryIcon />, path: '/admin/products' },
        { text: 'Featured Products', icon: <StarIcon />, path: '/admin/featured' },
        { text: 'Categories', icon: <CategoryIcon />, path: '/admin/categories' },
        { text: 'Featured Categories', icon: <FeaturedCategoriesIcon />, path: '/admin/featured-categories' },
        { text: 'Promotional Banner', icon: <CampaignOutlinedIcon />, path: '/admin/promotional-banner' },
    ];

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Admin Dashboard
                </Typography>
            </Box>

            {/* Add View Site button at the top */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Button
                    fullWidth
                    startIcon={<HomeIcon />}
                    onClick={handleViewSite}
                    variant="contained"
                    color="primary"
                    sx={{
                        mb: 1,
                        textTransform: 'none',
                    }}
                >
                    View Site
                </Button>
            </Box>

            <List sx={{ flexGrow: 1 }}>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        sx={{
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                            },
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>

            {/* Logout button at the bottom */}
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button
                    fullWidth
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    variant="outlined"
                    color="inherit"
                >
                    Logout
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile drawer toggle */}
            <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: 'none' }, position: 'absolute', top: 8, left: 8 }}
            >
                <MenuIcon />
            </IconButton>

            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
                }}
            >
                {drawer}
            </Drawer>

            {/* Desktop drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: DRAWER_WIDTH,
                        borderRight: `1px solid ${theme.palette.divider}`,
                    },
                }}
                open
            >
                {drawer}
            </Drawer>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { sm: `${DRAWER_WIDTH}px` },
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;