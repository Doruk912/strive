import React from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Button,
    Rating,
} from '@mui/material';

const ProductCard = ({ product }) => {
    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
            />
            <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                    {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {product.description}
                </Typography>
                <Rating value={product.rating} readOnly sx={{ mt: 1 }} />
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    ${product.price}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" color="primary">
                    Add to Cart
                </Button>
                <Button size="small" color="primary">
                    Learn More
                </Button>
            </CardActions>
        </Card>
    );
};

export default ProductCard;