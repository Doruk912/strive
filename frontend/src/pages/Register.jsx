import React, { useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Link,
    Grid,
    IconButton,
    InputAdornment,
    CircularProgress,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NAVBAR_HEIGHT = 64;

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        }

        if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
            isValid = false;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error when user starts typing
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            console.log('Registration data:', formData);
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate('/login');
        } catch (err) {
            setErrors({ ...errors, general: 'An error occurred during registration' });
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        container: {
            height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            margin: 0,
            padding: 0,
            overflow: 'hidden'
        },
        imageSection: {
            backgroundImage: 'url("https://i.pinimg.com/736x/82/2b/32/822b32b2cce1af8df475ce0eed27e704.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: isMobile ? '30vh' : `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            display: 'flex',
            justifyContent: 'flex-end'
        },
        formSection: {
            height: isMobile ? 'auto' : `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            padding: isMobile ? '20px' : '20px 0 20px 20px',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center'
        },
        paper: {
            p: isMobile ? 3 : 6,
            textAlign: 'center',
            width: isMobile ? '100%' : '520px',
            borderRadius: '12px',
            backgroundColor: '#fafafa',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
        },
        logo: {
            width: isMobile ? 40 : 60,
            height: isMobile ? 40 : 60,
            marginBottom: isMobile ? 10 : 15
        },
        submitButton: {
            mt: 4,
            p: 1.5,
            fontSize: isMobile ? '1rem' : '1.2rem',
            borderRadius: '8px',
            fontWeight: 'bold',
            backgroundColor: '#1565C0',
            '&:hover': {
                backgroundColor: '#0D47A1'
            }
        }
    };

    return (
        <Grid
            container
            sx={{
                ...styles.container,
                height: isMobile ? 'auto' : `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                flexDirection: isMobile ? 'column' : 'row'
            }}
        >
            <Grid item xs={12} md={6} sx={styles.imageSection} />

            <Grid item xs={12} md={6} sx={styles.formSection}>
                <Container maxWidth="sm">
                    <Paper elevation={6} sx={styles.paper}>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <img src="/logo192.png" alt="Logo" style={styles.logo} />
                            <Typography
                                variant={isMobile ? "h4" : "h3"}
                                fontWeight="bold"
                                color="#1565C0"
                                gutterBottom
                            >
                                Register
                            </Typography>
                        </Box>

                        <form onSubmit={handleSubmit} noValidate>
                            <TextField
                                fullWidth
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                margin="dense"
                                sx={{ mb: 2 }}
                                required
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                                disabled={isLoading}
                            />
                            <TextField
                                fullWidth
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                margin="dense"
                                sx={{ mb: 2 }}
                                required
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                                disabled={isLoading}
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                margin="dense"
                                sx={{ mb: 2 }}
                                required
                                error={!!errors.email}
                                helperText={errors.email}
                                disabled={isLoading}
                                inputProps={{
                                    autoComplete: 'email'
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                margin="dense"
                                sx={{ mb: 2 }}
                                required
                                error={!!errors.password}
                                helperText={errors.password}
                                disabled={isLoading}
                                InputProps={{
                                    sx: { paddingRight: '12px' },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                disabled={isLoading}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    autoComplete: 'new-password'
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                margin="dense"
                                sx={{ mb: 2 }}
                                required
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                disabled={isLoading}
                                InputProps={{
                                    sx: { paddingRight: '12px' },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                                disabled={isLoading}
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    autoComplete: 'new-password'
                                }}
                            />

                            {errors.general && (
                                <Typography color="error" sx={{ mt: 2 }}>
                                    {errors.general}
                                </Typography>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={isLoading}
                                sx={styles.submitButton}
                            >
                                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'REGISTER'}
                            </Button>

                            <Box sx={{ mt: 3, textAlign: 'center', fontSize: isMobile ? '1rem' : '1.1rem' }}>
                                <Link
                                    href="/login"
                                    variant="body2"
                                    sx={{
                                        textDecoration: 'none',
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    Already have an account? Sign in
                                </Link>
                            </Box>
                        </form>
                    </Paper>
                </Container>
            </Grid>
        </Grid>
    );
};

export default Register;