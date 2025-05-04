import React from 'react';
import { Box, Typography, Slide, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CartNotification = ({ open, product, quantity }) => {
    // If product is null, don't render the notification
    if (!product) return null;

    // Handle different types of images (base64 or URL)
    const renderImage = () => {
        if (product.images && product.images.length > 0 && product.images[0].imageBase64) {
            // If product has base64 images from API
            return `data:${product.images[0].imageType};base64,${product.images[0].imageBase64}`;
        } else if (product.image) {
            // If product has a direct image URL
            return product.image;
        }
        return '/default-product-image.jpg';
    };

    return (
        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
            <Paper
                elevation={4}
                sx={{
                    position: 'fixed',
                    top: { xs: '60px', md: '80px' },
                    right: { xs: '10px', md: '20px' },
                    zIndex: 1400,
                    width: { xs: 'calc(100% - 20px)', sm: '360px' },
                    maxWidth: '100%',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    animation: 'pulse 1.5s ease-in-out',
                    '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                    }
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'success.light',
                        color: 'success.dark',
                    }}
                >
                    <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Added to Cart Successfully
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', p: 0 }}>
                    <Box
                        sx={{
                            width: '120px',
                            height: '120px',
                            flexShrink: 0,
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <img
                            src={renderImage()}
                            alt={product.name || 'Product'}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                            onError={(e) => {
                                e.target.src = '/default-product-image.jpg';
                            }}
                        />
                    </Box>

                    <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                                {product.name || 'Product'}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                {product.selectedSize && (
                                    <Typography 
                                        variant="body2" 
                                        sx={{
                                            py: 0.5,
                                            px: 1,
                                            bgcolor: 'grey.100',
                                            borderRadius: 1,
                                            display: 'inline-block'
                                        }}
                                    >
                                        Size: {product.selectedSize}
                                    </Typography>
                                )}
                                <Typography 
                                    variant="body2" 
                                    sx={{
                                        py: 0.5,
                                        px: 1,
                                        bgcolor: 'grey.100',
                                        borderRadius: 1,
                                        display: 'inline-block'
                                    }}
                                >
                                    Qty: {quantity || 1}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mt: 1 }}>
                            ${((product.price || 0) * (quantity || 1)).toFixed(2)}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Slide>
    );
};

export default CartNotification;