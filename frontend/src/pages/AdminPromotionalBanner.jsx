import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    FormControlLabel,
    Switch,
    Chip,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import { styled } from "@mui/material/styles";
import { bannerService } from '../services/bannerService';
import { Helmet } from "react-helmet";

// Map of icon names to their component representations
const iconMap = {
    'LocalShippingOutlined': <LocalShippingOutlinedIcon />,
    'LocalOfferOutlined': <LocalOfferOutlinedIcon />,
    'NewReleasesOutlined': <NewReleasesOutlinedIcon />,
    'CardMembershipOutlined': <CardMembershipOutlinedIcon />,
    'AssignmentReturnOutlined': <AssignmentReturnOutlinedIcon />
};

const icons = [
    'LocalShippingOutlined',
    'LocalOfferOutlined',
    'NewReleasesOutlined',
    'CardMembershipOutlined',
    'AssignmentReturnOutlined',
];

const colors = [
    '#4051B5',
    '#2E7D32',
    '#C2185B',
    '#F57C00',
    '#0097A7',
    '#3F51B5',
    '#D32F2F',
    '#673AB7',
    '#FF5722',
    '#795548'
];

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    '&.MuiTableCell-head': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
}));

const AdminPromotionalBanner = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        highlight: '',
        icon: '',
        backgroundColor: '',
        active: true
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Fetch banners on component mount
    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const data = await bannerService.getAllBanners();
            setBanners(data.sort((a, b) => a.displayOrder - b.displayOrder));
            setLoading(false);
        } catch (err) {
            console.error('Error fetching banners:', err);
            setError('Failed to load promotional banners');
            setLoading(false);
            showSnackbar('Error loading banners', 'error');
        }
    };

    const handleOpen = (banner = null) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title,
                subtitle: banner.subtitle,
                highlight: banner.highlight,
                icon: banner.icon,
                backgroundColor: banner.backgroundColor,
                active: banner.active
            });
        } else {
            setEditingBanner(null);
            // Set default values when creating a new banner
            setFormData({
                title: '',
                subtitle: '',
                highlight: '',
                icon: 'LocalShippingOutlined',
                backgroundColor: '#4051B5',
                active: true
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingBanner(null);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const bannerToSubmit = {
                ...formData,
                // If editing, preserve the display order, otherwise it will be set by the backend
                displayOrder: editingBanner ? editingBanner.displayOrder : null
            };
            
            if (editingBanner) {
                await bannerService.updateBanner(editingBanner.id, bannerToSubmit);
                showSnackbar('Banner updated successfully');
            } else {
                await bannerService.createBanner(bannerToSubmit);
                showSnackbar('Banner created successfully');
            }
            fetchBanners(); // Refresh the banners list
            handleClose();
        } catch (error) {
            console.error('Error saving banner:', error);
            showSnackbar('Error saving banner', 'error');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                setLoading(true);
                await bannerService.deleteBanner(id);
                showSnackbar('Banner deleted successfully');
                fetchBanners(); // Refresh the banners list
            } catch (error) {
                console.error('Error deleting banner:', error);
                showSnackbar('Error deleting banner', 'error');
                setLoading(false);
            }
        }
    };

    const handleToggleActive = async (id, currentActiveState) => {
        try {
            setLoading(true);
            await bannerService.toggleBannerActive(id, !currentActiveState);
            showSnackbar(`Banner ${!currentActiveState ? 'activated' : 'deactivated'} successfully`);
            fetchBanners(); // Refresh the banners list
        } catch (error) {
            console.error('Error toggling banner status:', error);
            showSnackbar('Error updating banner status', 'error');
            setLoading(false);
        }
    };

    const handleMoveOrder = async (id, direction) => {
        try {
            setLoading(true);
            
            const currentBanner = banners.find(banner => banner.id === id);
            const currentIndex = banners.findIndex(banner => banner.id === id);
            
            if (!currentBanner) {
                throw new Error('Banner not found');
            }
            
            // Moving up (decreasing order number)
            if (direction === 'up' && currentIndex > 0) {
                const prevBanner = banners[currentIndex - 1];
                
                // First update the previous banner's order to avoid unique constraint conflicts
                await bannerService.updateBannerOrder(
                    prevBanner.id, 
                    currentBanner.displayOrder
                );
                
                // Then update the current banner's order
                await bannerService.updateBannerOrder(
                    currentBanner.id,
                    prevBanner.displayOrder
                );
                
                showSnackbar('Banner moved up successfully');
            }
            // Moving down (increasing order number)
            else if (direction === 'down' && currentIndex < banners.length - 1) {
                const nextBanner = banners[currentIndex + 1];
                
                // First update the next banner's order to avoid unique constraint conflicts
                await bannerService.updateBannerOrder(
                    nextBanner.id, 
                    currentBanner.displayOrder
                );
                
                // Then update the current banner's order
                await bannerService.updateBannerOrder(
                    currentBanner.id, 
                    nextBanner.displayOrder
                );
                
                showSnackbar('Banner moved down successfully');
            }
            
            // Refresh the banners list
            await fetchBanners();
        } catch (error) {
            console.error('Error updating banner order:', error);
            showSnackbar('Error updating banner order: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value, checked } = event.target;
        setFormData({
            ...formData,
            [name]: name === 'active' ? checked : value,
        });
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({
            ...snackbar,
            open: false
        });
    };

    return (
        <Box sx={{ mt: -10 }}>
            <Helmet>
                <title>Strive - Admin Banners</title>
            </Helmet>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h2">
                    Manage Promotional Banners
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    disabled={loading}
                >
                    Add New Banner
                </Button>
            </Box>

            {loading && !open ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Order</StyledTableCell>
                                <StyledTableCell>Title</StyledTableCell>
                                <StyledTableCell>Subtitle</StyledTableCell>
                                <StyledTableCell>Highlight</StyledTableCell>
                                <StyledTableCell>Icon</StyledTableCell>
                                <StyledTableCell>Background Color</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {banners.map((banner) => (
                                <TableRow key={banner.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {banner.displayOrder}
                                            <Box sx={{ ml: 1 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleMoveOrder(banner.id, 'up')}
                                                    disabled={banners.indexOf(banner) === 0}
                                                >
                                                    <KeyboardArrowUpIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleMoveOrder(banner.id, 'down')}
                                                    disabled={banners.indexOf(banner) === banners.length - 1}
                                                >
                                                    <KeyboardArrowDownIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{banner.title}</TableCell>
                                    <TableCell>{banner.subtitle}</TableCell>
                                    <TableCell>{banner.highlight}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {iconMap[banner.icon]}
                                            <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                                                {banner.icon}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                width: 50,
                                                height: 20,
                                                backgroundColor: banner.backgroundColor,
                                                borderRadius: 1,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={banner.active ? 'Active' : 'Inactive'} 
                                            color={banner.active ? 'success' : 'default'}
                                            size="small"
                                            onClick={() => handleToggleActive(banner.id, banner.active)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpen(banner)} disabled={loading}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(banner.id)} disabled={loading}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {banners.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">No banners found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                helperText="Example: Fast Delivery! (Avoid all caps)"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Subtitle"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                required
                                helperText="Example: Order now in New York, (Avoid all caps)"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Highlight"
                                name="highlight"
                                value={formData.highlight}
                                onChange={handleChange}
                                required
                                helperText="Example: Get it in 3 hours! (Avoid all caps)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Icon"
                                name="icon"
                                value={formData.icon}
                                onChange={handleChange}
                                required
                            >
                                {icons.map((icon) => (
                                    <MenuItem key={icon} value={icon}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {iconMap[icon]}
                                            <Typography variant="body2" sx={{ ml: 1 }}>
                                                {icon}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Background Color"
                                name="backgroundColor"
                                value={formData.backgroundColor}
                                onChange={handleChange}
                                required
                            >
                                {colors.map((color) => (
                                    <MenuItem key={color} value={color}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 30,
                                                    height: 20,
                                                    backgroundColor: color,
                                                    borderRadius: 1,
                                                }}
                                            />
                                            <Typography variant="body2">{color}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={formData.active}
                                        onChange={handleChange}
                                        name="active"
                                    />
                                }
                                label="Active"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        disabled={loading || !formData.title || !formData.subtitle || !formData.highlight}
                    >
                        {loading ? <CircularProgress size={24} /> : editingBanner ? 'Save Changes' : 'Add Banner'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminPromotionalBanner;