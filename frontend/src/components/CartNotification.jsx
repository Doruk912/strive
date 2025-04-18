import React from 'react';
import { Box, Typography, Slide } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CartNotification = ({ open, product, quantity }) => {
    // If product is null, don't render the notification
    if (!product) return null;

    return (
        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
            <Box
                sx={{
                    position: 'fixed',
                    top: { xs: '60px', md: '80px' },
                    right: { xs: '10px', md: '20px' },
                    zIndex: 1400,
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    width: { xs: 'calc(100% - 20px)', sm: '320px' },
                    maxWidth: '100%',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        borderBottom: '1px solid #eee',
                    }}
                >
                    <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Added to Cart
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', p: 2, gap: 2 }}>
                    <Box
                        sx={{
                            width: 70,
                            height: 70,
                            flexShrink: 0,
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                            overflow: 'hidden',
                        }}
                    >
                        <img
                            src={product.image || '/default-product-image.jpg'}
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

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            {product.name || 'Product'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Quantity: {quantity || 1}
                        </Typography>
                        {product.selectedSize && (
                            <Typography variant="body2" color="text.secondary">
                                Size: {product.selectedSize}
                            </Typography>
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                            ${((product.price || 0) * (quantity || 1)).toFixed(2)}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Slide>
    );
};

export default CartNotification;