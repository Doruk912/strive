import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import {
    Container,
    Grid,
    Typography,
    Box,
    Button,
    IconButton,
    Rating,
    Divider,
    Breadcrumbs,
    Link,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    MobileStepper,
    Paper,
    Avatar,
} from '@mui/material';
import {
    FavoriteBorder as FavoriteBorderIcon,
    Favorite as FavoriteIcon,
    NavigateNext as NavigateNextIcon,
    KeyboardArrowLeft,
    KeyboardArrowRight,
} from '@mui/icons-material';
import axios from 'axios';
import CartNotification from '../components/CartNotification';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems } = useCart();
    const { favoriteItems, addToFavorites, removeFromFavorites } = useFavorites();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [sizeError, setSizeError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [categoryPath, setCategoryPath] = useState([]);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                const [productRes, reviewsRes, ratingRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/products/${id}`),
                    axios.get(`http://localhost:8080/api/reviews/product/${id}`),
                    axios.get(`http://localhost:8080/api/reviews/product/${id}/rating`)
                ]);
                
                setProduct(productRes.data);
                setReviews(reviewsRes.data);
                setAverageRating(ratingRes.data || 0);

                // Fetch category path
                if (productRes.data.categoryId) {
                    const categoryRes = await axios.get(`http://localhost:8080/api/categories`);
                    const categories = categoryRes.data;
                    const path = findCategoryPath(categories, productRes.data.categoryId);
                    setCategoryPath(path);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching product data:', err);
                if (err.response && err.response.status === 404) {
                    setError('Product not found');
                } else {
                    setError('An error occurred while fetching the product');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductData();
        }
    }, [id]);

    const findCategoryPath = (categories, targetId) => {
        const path = [];
        
        const findPath = (cats, id) => {
            for (const cat of cats) {
                if (cat.id === id) {
                    path.push(cat);
                    return true;
                }
                if (cat.children && cat.children.length > 0) {
                    if (findPath(cat.children, id)) {
                        path.unshift(cat);
                        return true;
                    }
                }
            }
            return false;
        };

        findPath(categories, targetId);
        return path;
    };

    const totalStock = product?.stocks?.reduce((total, stock) => total + (stock.stock || 0), 0) || 0;
    const isInCart = cartItems.some(item => 
        item.id === product?.id && item.selectedSize === selectedSize
    );
    const isFavorite = favoriteItems.some(item => item.id === product?.id);

    const handleAddToCart = () => {
        if (!selectedSize) {
            setSizeError(true);
            return;
        }

        const stockForSize = product.stocks?.find(stock => stock.size === selectedSize);
        if (!stockForSize || stockForSize.stock < quantity) {
            return;
        }

        if (!isInCart && product) {
            const productWithImage = {
                ...product,
                image: product.images && product.images.length > 0
                    ? `data:${product.images[0].imageType};base64,${product.images[0].imageBase64}`
                    : '/default-product-image.jpg'
            };
            const success = addToCart(productWithImage, quantity, selectedSize);
            if (success) {
                setSizeError(false);
                setOpenSnackbar(true);
                setTimeout(() => {
                    setOpenSnackbar(false);
                }, 3000);
            }
        }
    };

    const handleSizeChange = (e) => {
        setSelectedSize(e.target.value);
        setSizeError(false);
        // Reset quantity when size changes
        setQuantity(1);
    };

    const getSortedSizes = (stocks) => {
        const sizeOrder = {
            'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 'XL': 6, 'XXL': 7, '3XL': 8,
            '35': 9, '36': 10, '37': 11, '38': 12, '39': 13, '40': 14, '41': 15, '42': 16, '43': 17, '44': 18, '45': 19,
            'ONE SIZE': 99
        };

        return [...stocks].sort((a, b) => {
            const orderA = sizeOrder[a.size] || 100;
            const orderB = sizeOrder[b.size] || 100;
            return orderA - orderB;
        });
    };

    const toggleFavorite = () => {
        if (!product) return;
        
        if (isFavorite) {
            removeFromFavorites(product.id);
        } else {
            addToFavorites(product);
        }
    };

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Box sx={{ p: 3 }}>
                    <Alert severity="error">{error}</Alert>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/shop')}
                        sx={{ mt: 2 }}
                    >
                        Return to Shop
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container>
                <Box sx={{ p: 3 }}>
                    <Alert severity="warning">Product not found</Alert>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/shop')}
                        sx={{ mt: 2 }}
                    >
                        Return to Shop
                    </Button>
                </Box>
            </Container>
        );
    }

    const maxSteps = product.images?.length || 0;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 4 }}
            >
                <Link
                    component="button"
                    onClick={() => navigate('/')}
                    color="inherit"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                    Home
                </Link>
                {categoryPath.map((category) => (
                    <Link
                        key={category.id}
                        component="button"
                        onClick={() => navigate(`/products?category=${category.id}`)}
                        color="inherit"
                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                        {category.name}
                    </Link>
                ))}
                <Typography color="text.primary">{product.name}</Typography>
            </Breadcrumbs>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            width: '100%',
                            position: 'relative',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            overflow: 'hidden',
                        }}
                    >
                        {maxSteps > 0 && (
                            <>
                                <Box
                                    sx={{
                                        height: { xs: '300px', md: '500px' },
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >
                                    <img
                                        src={product.images[activeStep]
                                            ? `data:${product.images[activeStep].imageType};base64,${product.images[activeStep].imageBase64}`
                                            : '/default-product-image.jpg'}
                                        alt={`${product.name} - ${activeStep + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </Box>
                                {maxSteps > 1 && (
                                    <MobileStepper
                                        steps={maxSteps}
                                        position="static"
                                        activeStep={activeStep}
                                        sx={{
                                            backgroundColor: 'transparent',
                                            '& .MuiMobileStepper-dot': {
                                                backgroundColor: 'rgba(0,0,0,0.3)',
                                            },
                                            '& .MuiMobileStepper-dotActive': {
                                                backgroundColor: 'primary.main',
                                            },
                                        }}
                                        nextButton={
                                            <Button
                                                size="small"
                                                onClick={handleNext}
                                                disabled={activeStep === maxSteps - 1}
                                            >
                                                Next
                                                <KeyboardArrowRight />
                                            </Button>
                                        }
                                        backButton={
                                            <Button
                                                size="small"
                                                onClick={handleBack}
                                                disabled={activeStep === 0}
                                            >
                                                <KeyboardArrowLeft />
                                                Back
                                            </Button>
                                        }
                                    />
                                )}
                            </>
                        )}
                    </Box>
                    {maxSteps > 1 && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto', pb: 1 }}>
                            {product.images.map((image, index) => (
                                <Box
                                    key={index}
                                    onClick={() => setActiveStep(index)}
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: activeStep === index ? '2px solid #2E7D32' : '2px solid transparent',
                                        '&:hover': {
                                            opacity: 0.8,
                                        },
                                    }}
                                >
                                    <img
                                        src={`data:${image.imageType};base64,${image.imageBase64}`}
                                        alt={`Thumbnail ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box sx={{ position: 'relative' }}>
                        <IconButton
                            onClick={toggleFavorite}
                            sx={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                color: isFavorite ? 'error.main' : 'action.active',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                },
                            }}
                        >
                            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>

                        <Typography variant="h4" component="h1" gutterBottom>
                            {product.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating value={averageRating} readOnly precision={0.5} />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                ({averageRating.toFixed(1)} / 5)
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                            </Typography>
                        </Box>

                        <Typography variant="h5" sx={{ mb: 2 }}>
                            ${Number(product.price).toFixed(2)}
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 3 }}>
                            {product.description}
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Category: <span style={{ color: '#666' }}>{product.categoryName}</span>
                            </Typography>
                            <Typography variant="subtitle1">
                                Available: <span style={{ color: totalStock > 0 ? '#4caf50' : '#f44336', fontWeight: 500 }}>
                                    {totalStock} units
                                </span>
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                            <Box>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                                    Select Size
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {getSortedSizes(product.stocks || []).map((stock) => (
                                        <Button
                                            key={stock.size}
                                            variant={selectedSize === stock.size ? "contained" : "outlined"}
                                            onClick={() => handleSizeChange({ target: { value: stock.size } })}
                                            disabled={stock.stock === 0}
                                            sx={{
                                                minWidth: '60px',
                                                height: '40px',
                                                borderColor: sizeError ? '#f44336' : 'inherit',
                                                backgroundColor: selectedSize === stock.size ? '#000' : 'transparent',
                                                color: selectedSize === stock.size ? '#fff' : (stock.stock === 0 ? '#bdbdbd' : '#000'),
                                                '&:hover': {
                                                    backgroundColor: selectedSize === stock.size ? '#333' : 'rgba(0,0,0,0.04)',
                                                },
                                                '&.Mui-disabled': {
                                                    borderColor: '#e0e0e0',
                                                    color: '#bdbdbd',
                                                }
                                            }}
                                        >
                                            {stock.size}
                                        </Button>
                                    ))}
                                </Box>
                                {sizeError && (
                                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                        Please select a size
                                    </Typography>
                                )}
                                {selectedSize && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        {product.stocks?.find(s => s.size === selectedSize)?.stock || 0} items available in this size
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormControl sx={{ width: 100 }}>
                                    <InputLabel>Qty</InputLabel>
                                    <Select
                                        value={quantity}
                                        label="Qty"
                                        onChange={(e) => setQuantity(e.target.value)}
                                        disabled={!selectedSize}
                                    >
                                        {[...Array(Math.min(10, selectedSize ? (product.stocks?.find(s => s.size === selectedSize)?.stock || 0) : 0))].map((_, i) => (
                                            <MenuItem key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={handleAddToCart}
                                    disabled={totalStock === 0 || isInCart}
                                    sx={{
                                        backgroundColor: '#000',
                                        '&:hover': {
                                            backgroundColor: '#333',
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#ccc',
                                        },
                                    }}
                                >
                                    {totalStock === 0 ? 'Out of Stock' : 
                                     isInCart ? 'Already in Cart' : 
                                     'Add to Cart'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Reviews Section */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    Customer Reviews ({reviews.length})
                </Typography>
                {reviews.length > 0 ? (
                    <Grid container spacing={3}>
                        {reviews.map((review) => (
                            <Grid item xs={12} key={review.id}>
                                <Paper sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ mr: 2 }}>{review.userName?.[0] || 'U'}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle1">
                                                {review.userName || 'Anonymous'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Rating 
                                            value={review.rating} 
                                            readOnly 
                                            size="small" 
                                            sx={{ ml: 'auto' }}
                                        />
                                    </Box>
                                    <Typography variant="body1">
                                        {review.comment}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        No reviews yet. Be the first to review this product!
                    </Typography>
                )}
            </Box>

            <CartNotification
                open={openSnackbar}
                product={product}
                quantity={quantity}
            />
        </Container>
    );
};

export default ProductDetail;