import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    Select,
    MenuItem,
    IconButton,
    Snackbar,
    Alert,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Tooltip,
    Chip,
    Button,
    ListSubheader
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    Star as StarIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    height: '140px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
    },
}));

const StyledCardMedia = styled(CardMedia)({
    width: '120px',
    height: '140px',
    flexShrink: 0,
    objectFit: 'cover',
});

const ContentWrapper = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexGrow: 1,
});

const AdminFeaturedCategories = () => {
    const navigate = useNavigate();
    const [featuredCategories, setFeaturedCategories] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Get token from localStorage
    const getAuthToken = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.token;
    };

    useEffect(() => {
        const token = getAuthToken();
        if (!token) {
            navigate('/login');
            return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchFeaturedCategories();
        fetchAllCategories();
    }, [navigate]);

    const fetchFeaturedCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/featured-categories');
            setFeaturedCategories(response.data);
        } catch (error) {
            console.error('Error fetching featured categories:', error);
            handleError(error);
        }
    };

    const fetchAllCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/categories');
            setAvailableCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            handleError(error);
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
        setSelectedCategory('');
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleAddCategory = async () => {
        if (!selectedCategory) {
            showNotification('Please select a category', 'error');
            return;
        }

        try {
            await axios.post('http://localhost:8080/api/featured-categories', {
                categoryId: selectedCategory
            });
            await fetchFeaturedCategories();
            showNotification('Category added to featured list', 'success');
            handleCloseDialog();
        } catch (error) {
            console.error('Error adding featured category:', error);
            handleError(error);
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/featured-categories/${id}`);
            await fetchFeaturedCategories();
            showNotification('Category removed from featured list', 'success');
        } catch (error) {
            console.error('Error removing featured category:', error);
            handleError(error);
        }
    };

    const handleMoveCategory = async (id, direction) => {
        try {
            await axios.put(`http://localhost:8080/api/featured-categories/${id}/order`, {
                direction: direction
            });
            await fetchFeaturedCategories();
        } catch (error) {
            console.error('Error updating category order:', error);
            handleError(error);
        }
    };

    const handleError = (error) => {
        if (error.response?.status === 401) {
            navigate('/login');
        } else {
            showNotification(
                error.response?.data?.message || 'An error occurred. Please try again.',
                'error'
            );
        }
    };

    const showNotification = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const remainingSlots = 6 - featuredCategories.length;

    const flattenCategories = (categories) => {
        const flattened = [];

        const processCategory = (category, parentNames = []) => {
            // Add the current category
            const displayName = [...parentNames, category.name].join(' → ');
            flattened.push({
                ...category,
                displayName: displayName
            });

            // Process children if they exist
            if (category.children && category.children.length > 0) {
                category.children.forEach(child => {
                    processCategory(child, [...parentNames, category.name]);
                });
            }
        };

        categories.forEach(category => processCategory(category));
        return flattened;
    };

    const renderCategoryName = (category) => {
        const pathParts = category.displayName.split(' → ');
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {pathParts.map((part, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <ArrowForwardIcon sx={{ mx: 1, fontSize: 16, color: 'text.secondary' }} />}
                        <Typography
                            variant="body1"
                            component="span"
                            sx={{
                                color: index === pathParts.length - 1 ? 'text.primary' : 'text.secondary',
                                fontWeight: index === pathParts.length - 1 ? 500 : 400
                            }}
                        >
                            {part}
                        </Typography>
                    </React.Fragment>
                ))}
            </Box>
        );
    };

    return (
        <Box sx={{ mt: -10 }}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Featured Categories
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage homepage featured categories
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            icon={<StarIcon />}
                            label={`${remainingSlots} slots remaining`}
                            color={remainingSlots === 0 ? "error" : "primary"}
                            variant="outlined"
                        />
                        <Tooltip title={remainingSlots === 0 ? "Maximum categories reached" : "Add new featured category"}>
                            <span>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleOpenDialog}
                                    disabled={remainingSlots === 0}
                                    size="small"
                                >
                                    Add Category
                                </Button>
                            </span>
                        </Tooltip>
                    </Box>
                </Box>

                <Grid container spacing={2}>
                    {featuredCategories.map((category) => (
                        <Grid item xs={12} md={6} key={category.id}>
                            <StyledCard>
                                <StyledCardMedia
                                    component="img"
                                    image={category.imageBase64 ? `data:${category.imageType};base64,${category.imageBase64}` : '/placeholder-image.jpg'}
                                    alt={category.name}
                                />
                                <ContentWrapper>
                                    <CardContent sx={{ pb: 0 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" component="div">
                                                {category.name}
                                            </Typography>
                                            <Chip
                                                label={`Position ${category.displayOrder}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: 24 }}
                                            />
                                        </Box>
                                        {category.parentName && (
                                            <Typography variant="body2" color="text.secondary">
                                                {category.parentPath}
                                            </Typography>
                                        )}
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="Move up">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleMoveCategory(category.id, 'up')}
                                                        disabled={category.displayOrder === 1}
                                                    >
                                                        <KeyboardArrowUpIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Move down">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleMoveCategory(category.id, 'down')}
                                                        disabled={category.displayOrder === featuredCategories.length}
                                                    >
                                                        <KeyboardArrowDownIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Box>
                                        <Tooltip title="Remove from featured">
                                            <IconButton
                                                onClick={() => handleDeleteCategory(category.id)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </CardActions>
                                </ContentWrapper>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Add Featured Category</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                        <Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            displayEmpty
                            sx={{ borderRadius: 1 }}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 400
                                    }
                                }
                            }}
                        >
                            <MenuItem value="" disabled>Select a category</MenuItem>
                            {flattenCategories(availableCategories)
                                .filter(cat => !featuredCategories.some(f => f.categoryId === cat.id))
                                .map(category => (
                                    <MenuItem 
                                        key={category.id} 
                                        value={category.id}
                                        sx={{ 
                                            minHeight: '48px'
                                        }}
                                    >
                                        {renderCategoryName(category)}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleAddCategory} variant="contained" color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminFeaturedCategories;