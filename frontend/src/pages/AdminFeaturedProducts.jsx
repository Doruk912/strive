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
} from '@mui/material';
import {
    Star as StarIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { products } from '../mockData/Products';

const FeaturedProducts = () => {
    const [featuredProducts, setFeaturedProducts] = useState(
        products.map(p => ({ ...p, isFeatured: false }))
    );
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

    const categories = useMemo(() => {
        const cats = [...new Set(products.map(p => p.category))];
        return ['all', ...cats];
    }, []);

    const filteredProducts = useMemo(() => {
        return featuredProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
            const matchesFeatured = !showFeaturedOnly || product.isFeatured;
            return matchesSearch && matchesCategory && matchesFeatured;
        });
    }, [featuredProducts, searchQuery, categoryFilter, showFeaturedOnly]);

    const handleToggleFeatured = (productId) => {
        setFeaturedProducts(prev =>
            prev.map(p =>
                p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p
            )
        );
    };

    const handleSave = () => {
        console.log('Featured products:', featuredProducts.filter(p => p.isFeatured));
        setOpenSnackbar(true);
    };

    const featuredCount = featuredProducts.filter(p => p.isFeatured).length;

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
                            label={`${featuredCount} Selected`}
                            color="secondary"
                            size="small"
                        />
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            sx={{
                                backgroundColor: 'white',
                                color: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'grey.100',
                                }
                            }}
                        >
                            Save Changes
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Filters Section */}
            {/* Filters Section */}
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
                            '& .MuiInputBase-input': {
                                fontSize: '0.975rem',
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
                    >
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            label="Category"
                        >
                            {categories.map(category => (
                                <MenuItem
                                    key={category}
                                    value={category}
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    {category}
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
                        label={
                            <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>
                                Show Featured Only
                            </Typography>
                        }
                    />
                </Stack>
            </Paper>

            {/* Results Summary */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Showing {filteredProducts.length} of {products.length} products
                </Typography>
            </Box>

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
                                image={product.image}
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
                                    Category: {product.category}
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
                    severity="success"
                    onClose={() => setOpenSnackbar(false)}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Featured products updated successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FeaturedProducts;