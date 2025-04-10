import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Switch,
    FormControlLabel,
    Button,
    Snackbar,
    Alert,
    Chip,
    Divider,
    Paper,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    IconButton,
} from '@mui/material';
import {
    Star as StarIcon,
    Search as SearchIcon,
    ArrowForward as ArrowForwardIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useEffect } from 'react';

const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
    const [categories, setCategories] = useState([]);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            //showSnackbar('Error fetching products', 'error');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const flattenCategories = (categories) => {
        const flattened = [];

        const processCategory = (category, parentNames = []) => {
            const displayName = [...parentNames, category.name].join(' → ');
            flattened.push({
                ...category,
                displayName: displayName
            });

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
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                {pathParts.map((part, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                        <Typography
                            variant="body2"
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

    const isProductInCategory = (product, categoryId) => {
        if (categoryId === 'all') return true;
        if (product.categoryId === categoryId) return true;

        const flattenedCategories = flattenCategories(categories);
        const productCategory = flattenedCategories.find(c => c.id === product.categoryId);
        if (!productCategory) return false;

        const categoryPath = productCategory.displayName.split(' → ');
        const filterCategory = flattenedCategories.find(c => c.id === categoryId);
        if (!filterCategory) return false;

        return categoryPath.includes(filterCategory.name);
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = isProductInCategory(product, categoryFilter);
            const matchesFeatured = !showFeaturedOnly || product.isFeatured;
            return matchesSearch && matchesCategory && matchesFeatured;
        });
    }, [products, searchQuery, categoryFilter, showFeaturedOnly]);

    const featuredProducts = useMemo(() => {
        return products
            .filter(p => p.isFeatured)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }, [products]);

    const handleToggleFeatured = async (productId) => {
        try {
            const product = products.find(p => p.id === productId);
            const response = await axios.put(`http://localhost:8080/api/products/${productId}/featured`);
            
            setProducts(prev =>
                prev.map(p =>
                    p.id === productId ? response.data : p
                )
            );
            
            showSnackbar(
                `Product ${response.data.isFeatured ? 'added to' : 'removed from'} featured products`,
                'success'
            );
        } catch (error) {
            console.error('Error toggling featured status:', error);
            showSnackbar('Error updating featured status', 'error');
        }
    };

    const moveProduct = async (index, direction) => {
        const newProducts = [...featuredProducts];
        const item = newProducts[index];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= newProducts.length) return;

        newProducts.splice(index, 1);
        newProducts.splice(newIndex, 0, item);

        // Update display order for all featured products
        const updatedProducts = newProducts.map((item, index) => ({
            ...item,
            displayOrder: index
        }));

        try {
            // Send only the product IDs in the new order
            const productIds = updatedProducts.map(p => p.id);
            const response = await axios.put('http://localhost:8080/api/products/featured/reorder', productIds);

            // Update the products state with the response data
            setProducts(prev => {
                const newProducts = [...prev];
                response.data.forEach(updatedProduct => {
                    const index = newProducts.findIndex(p => p.id === updatedProduct.id);
                    if (index !== -1) {
                        newProducts[index] = updatedProduct;
                    }
                });
                return newProducts;
            });

            showSnackbar('Product order updated successfully', 'success');
        } catch (error) {
            console.error('Error updating product order:', error);
            showSnackbar('Error updating product order', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
    };

    return (
        <Box sx={{ mt: -10 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    borderRadius: 2,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Featured Products
                        </Typography>
                        <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                            Select products to showcase on the home page
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            label={`${featuredProducts.length} Featured`}
                            color="secondary"
                            size="small"
                        />
                    </Box>
                </Box>
            </Paper>

            {featuredProducts.length > 0 && (
                <Paper sx={{ p: 3, mb: 3, backgroundColor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>
                        Current Featured Products
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Use the arrows to change the order of featured products
                    </Typography>
                    <Stack spacing={2}>
                        {featuredProducts.map((product, index) => (
                            <Paper
                                key={product.id}
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    backgroundColor: 'white'
                                }}
                            >
                                <Box
                                    component="img"
                                    src={product.images?.[0]?.url || 'https://via.placeholder.com/50'}
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        objectFit: 'cover',
                                        borderRadius: 1
                                    }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1">
                                        {product.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {product.categoryName}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => moveProduct(index, 'up')}
                                        disabled={index === 0}
                                    >
                                        <ArrowUpwardIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => moveProduct(index, 'down')}
                                        disabled={index === featuredProducts.length - 1}
                                    >
                                        <ArrowDownwardIcon />
                                    </IconButton>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={product.isFeatured}
                                                onChange={() => handleToggleFeatured(product.id)}
                                            />
                                        }
                                        label="Featured"
                                    />
                                </Box>
                            </Paper>
                        ))}
                    </Stack>
                </Paper>
            )}

            <Paper
                sx={{
                    p: 2,
                    mb: 3,
                    backgroundColor: 'grey.50',
                    borderRadius: 2,
                }}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        sx={{
                            flexGrow: 1,
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'grey.300',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'grey.400',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
                                },
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl
                        size="small"
                        sx={{
                            minWidth: 200,
                            backgroundColor: 'white',
                        }}
                    >
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            label="Category"
                        >
                            <MenuItem value="all">All Categories</MenuItem>
                            {flattenCategories(categories).map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {renderCategoryName(category)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showFeaturedOnly}
                                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                            />
                        }
                        label="Show Featured Only"
                    />
                </Stack>
            </Paper>

            <Grid container spacing={3}>
                {filteredProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 3,
                                }
                            }}
                        >
                            {product.isFeatured && (
                                <Chip
                                    icon={<StarIcon />}
                                    label="Featured"
                                    color="primary"
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        zIndex: 1,
                                    }}
                                />
                            )}
                            <CardMedia
                                component="img"
                                height="200"
                                image={product.images?.[0]?.url || 'https://via.placeholder.com/200'}
                                alt={product.name}
                                sx={{
                                    objectFit: 'cover',
                                    borderBottom: '1px solid',
                                    borderColor: 'grey.200',
                                }}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Category: {product.categoryName}
                                </Typography>
                                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                    ${Number(product.price).toFixed(2)}
                                </Typography>
                            </CardContent>
                            <Divider />
                            <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={product.isFeatured}
                                            onChange={() => handleToggleFeatured(product.id)}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            {product.isFeatured ? 'Featured' : 'Add to Featured'}
                                        </Typography>
                                    }
                                />
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {filteredProducts.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No products found matching your criteria
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try adjusting your search or filters
                    </Typography>
                </Paper>
            )}

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={snackbarSeverity}
                    onClose={() => setOpenSnackbar(false)}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FeaturedProducts;