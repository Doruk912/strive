import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Container } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { keyframes } from '@mui/system';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import { useSwipeable } from 'react-swipeable';

const slideIn = keyframes`
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

const PromotionalBanner = () => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const promotions = [
        {
            title: "Fast Delivery!",
            subtitle: "Order now in New York,",
            highlight: "get it in 3 hours!",
            icon: <LocalShippingOutlinedIcon sx={{ fontSize: { xs: 24, md: 32 } }} />,
            backgroundColor: "#4051B5",
        },
        {
            title: "Special Offer!",
            subtitle: "Get 20% off",
            highlight: "on all sports equipment",
            icon: <LocalOfferOutlinedIcon sx={{ fontSize: { xs: 24, md: 32 } }} />,
            backgroundColor: "#2E7D32",
        },
        {
            title: "New Collection!",
            subtitle: "Discover our",
            highlight: "Summer 2024 collection",
            icon: <NewReleasesOutlinedIcon sx={{ fontSize: { xs: 24, md: 32 } }} />,
            backgroundColor: "#C2185B",
        },
        {
            title: "Members Only!",
            subtitle: "Join our club and get",
            highlight: "exclusive benefits",
            icon: <CardMembershipOutlinedIcon sx={{ fontSize: { xs: 24, md: 32 } }} />,
            backgroundColor: "#F57C00",
        },
        {
            title: "Free Returns!",
            subtitle: "Try at home with",
            highlight: "30-day free returns",
            icon: <AssignmentReturnOutlinedIcon sx={{ fontSize: { xs: 24, md: 32 } }} />,
            backgroundColor: "#0097A7",
        }
    ];

    useEffect(() => {
        let interval;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                setActiveSlide((prev) => (prev + 1) % promotions.length);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, promotions.length]);

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            setActiveSlide((prev) => (prev + 1) % promotions.length);
            setIsAutoPlaying(false);
        },
        onSwipedRight: () => {
            setActiveSlide((prev) => (prev - 1 + promotions.length) % promotions.length);
            setIsAutoPlaying(false);
        },
        swipeDuration: 500,
        preventScrollOnSwipe: true,
        trackMouse: false,
        trackTouch: true,
    });

    return (
        <Container
            maxWidth={false}
            sx={{
                width: '90%',
                mx: 'auto',
                px: { xs: 1, md: 2 },
                mb: 4,
            }}
        >
            <Box
                {...handlers}
                sx={{
                    width: '100%',
                    backgroundColor: promotions[activeSlide].backgroundColor,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'background-color 0.3s ease',
                    touchAction: 'pan-y pinch-zoom',
                }}
            >
                {/* Navigation Arrows - Moved outside the content box */}
                <IconButton
                    onClick={() => {
                        setActiveSlide((prev) => (prev - 1 + promotions.length) % promotions.length);
                        setIsAutoPlaying(false);
                    }}
                    sx={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        zIndex: 2,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        display: { xs: 'none', md: 'flex' },
                    }}
                >
                    <ArrowBackIosNewIcon sx={{ fontSize: '1rem' }} />
                </IconButton>

                <IconButton
                    onClick={() => {
                        setActiveSlide((prev) => (prev + 1) % promotions.length);
                        setIsAutoPlaying(false);
                    }}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        zIndex: 2,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        display: { xs: 'none', md: 'flex' },
                    }}
                >
                    <ArrowForwardIosIcon sx={{ fontSize: '1rem' }} />
                </IconButton>

                {/* Content Container */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: { xs: 4, md: 5 },
                        px: { xs: 3, md: 6 },
                        minHeight: { xs: '120px', md: '140px' },
                    }}
                >
                    {/* Content Box */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: { xs: 2, md: 3 },
                            animation: `${slideIn} 0.5s ease-out`,
                            width: '100%',
                            maxWidth: '800px',
                        }}
                    >
                        {/* Icon */}
                        <Box
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '50%',
                                p: { xs: 1.5, md: 2 },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 0.3s ease',
                                flexShrink: 0,
                            }}
                        >
                            {promotions[activeSlide].icon}
                        </Box>

                        {/* Text Content */}
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontSize: { xs: '0.9rem', md: '1rem' },
                                    fontWeight: 500,
                                    mb: 0.5,
                                    letterSpacing: '0.5px',
                                    color: 'white',
                                }}
                            >
                                {promotions[activeSlide].title}
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                    color: 'white',
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontSize: { xs: '1.1rem', md: '1.3rem' },
                                        fontWeight: 600,
                                    }}
                                >
                                    {promotions[activeSlide].subtitle}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontSize: { xs: '1.1rem', md: '1.3rem' },
                                        fontWeight: 600,
                                        color: '#a5f3ff',
                                        ...(promotions[activeSlide].highlightStyle || {})
                                    }}
                                >
                                    {promotions[activeSlide].highlight}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Navigation Dots */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: { xs: 1.5, md: 1 },
                        zIndex: 2,
                    }}
                >
                    {promotions.map((_, index) => (
                        <Box
                            key={index}
                            onClick={() => {
                                setActiveSlide(index);
                                setIsAutoPlaying(false);
                            }}
                            sx={{
                                width: { xs: 8, md: 6 },
                                height: { xs: 8, md: 6 },
                                borderRadius: '50%',
                                backgroundColor: activeSlide === index
                                    ? 'white'
                                    : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.2)',
                                    backgroundColor: 'white',
                                },
                            }}
                        />
                    ))}
                </Box>
            </Box>
        </Container>
    );
};

export default PromotionalBanner;