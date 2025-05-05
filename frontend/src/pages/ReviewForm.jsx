import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    TextField,
    Button,
    Rating,
    Snackbar,
    Alert,
    CircularProgress,
    Card,
    CardMedia,
    Divider,
    useTheme
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const ReviewForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    
    // Get product ID and order ID from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const productId = queryParams.get('productId');
    const orderId = queryParams.get('orderId');
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [existingReview, setExistingReview] = useState(null);
    
    useEffect(() => {
        const fetchProductAndExistingReview = async () => {
            if (!productId) {
                setError('Product ID is missing. Please check the URL and try again.');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                
                // Fetch product details
                const productResponse = await fetch(`http://localhost:8080/api/products/${productId}`);
                if (!productResponse.ok) {
                    throw new Error('Failed to fetch product');
                }
                const productData = await productResponse.json();
                setProduct(productData);
                
                // Check if user has already reviewed this product
                if (user) {
                    try {
                        const reviewResponse = await fetch(
                            `http://localhost:8080/api/reviews/user/${user.userId}/product/${productId}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${user.token}`
                                }
                            }
                        );
                        
                        if (reviewResponse.ok) {
                            const reviewData = await reviewResponse.json();
                            setExistingReview(reviewData);
                            setRating(reviewData.rating);
                            setComment(reviewData.comment);
                        }
                    } catch (reviewError) {
                        console.error('Error checking for existing review:', reviewError);
                        // Continue even if we fail to check for an existing review
                    }
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                setError('Failed to load product. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchProductAndExistingReview();
    }, [productId, user]);
    
    const handleSubmitReview = async () => {
        if (!product || !user) {
            setSnackbar({
                open: true,
                message: 'Please log in to submit a review',
                severity: 'error'
            });
            return;
        }
        
        if (!rating) {
            setSnackbar({
                open: true,
                message: 'Please select a rating',
                severity: 'error'
            });
            return;
        }
        
        if (!comment.trim()) {
            setSnackbar({
                open: true,
                message: 'Please enter a comment',
                severity: 'error'
            });
            return;
        }
        
        setSubmitting(true);
        
        try {
            const reviewData = {
                productId: product.id,
                userId: user.userId,
                rating: rating,
                comment: comment
            };
            
            const response = await fetch('http://localhost:8080/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(reviewData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit review');
            }
            
            // Show success message
            setSnackbar({
                open: true,
                message: existingReview 
                    ? 'Your review has been updated successfully!' 
                    : 'Thank you for your review! It will help other customers.',
                severity: 'success'
            });
            
            // Redirect to product page after 2 seconds
            setTimeout(() => {
                navigate(`/product/${productId}`);
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting review:', error);
            setSnackbar({
                open: true,
                message: 'Failed to submit review. Please try again.',
                severity: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };
    
    const handleSnackbarClose = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };
    
    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }
    
    if (!user) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="warning">
                    Please log in to submit a review. 
                    <Button 
                        variant="text" 
                        color="inherit" 
                        sx={{ ml: 2 }} 
                        onClick={() => navigate('/login', { state: { from: location.pathname + location.search } })}
                    >
                        Log In
                    </Button>
                </Alert>
            </Container>
        );
    }
    
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {existingReview ? 'Edit Your Review' : 'Write a Review'}
            </Typography>
            
            {product && (
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: 3 }}>
                        {product.images?.[0] && (
                            <Box sx={{ mr: { sm: 3 }, mb: { xs: 2, sm: 0 }, flexShrink: 0 }}>
                                <img 
                                    src={`data:${product.images[0].imageType};base64,${product.images[0].imageBase64}`}
                                    alt={product.name}
                                    style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}
                                />
                            </Box>
                        )}
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                {product.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                {product.description}
                            </Typography>
                            {orderId && (
                                <Typography variant="body2" color="text.secondary">
                                    From Order #{orderId}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Your Rating
                        </Typography>
                        <Rating
                            name="product-rating"
                            value={rating}
                            onChange={(event, newValue) => {
                                setRating(newValue);
                            }}
                            size="large"
                            sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            Select a rating from 1 to 5 stars
                        </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Your Review
                        </Typography>
                        <TextField
                            multiline
                            rows={5}
                            fullWidth
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this product. What did you like or dislike? Would you recommend it to others?"
                            variant="outlined"
                        />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="contained" 
                            color="primary"
                            disabled={submitting || !rating || !comment.trim()}
                            onClick={handleSubmitReview}
                        >
                            {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                        </Button>
                    </Box>
                </Paper>
            )}
            
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ReviewForm; 