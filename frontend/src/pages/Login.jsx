import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Typography,
    Box,
    Link,
    FormControlLabel,
    Checkbox,
    CircularProgress,
    useTheme,
    useMediaQuery,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet';
import axios from 'axios';

const Login = () => {
    const getErrorMessage = (errorType) => {
        const errorMessages = {
            'Invalid credentials': 'The email or password you entered is incorrect',
            'Email required': 'Please enter your email address',
            'Password required': 'Please enter your password',
            'Invalid email': 'Please enter a valid email address',
            'Password length': 'Password must be at least 6 characters',
            'Network error': 'Unable to connect to the server. Please check your internet connection',
            'default': 'An error occurred. Please try again'
        };
        return errorMessages[errorType] || errorMessages.default;
    };

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const { login } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setFormData({ ...formData, email: savedEmail });
            setRememberMe(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear the specific error when the user starts typing in a field
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
        
        // If there was a submit error, clear it when any field is modified
        if (errors.submit) {
            setErrors({ ...errors, submit: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email) {
            newErrors.email = 'Email required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password required';
        } else if (formData.password.length < 3) {
            newErrors.password = 'Password length';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', formData);
            
            if (response.status !== 200) {
                throw new Error('Invalid credentials');
            }
            
            const userData = response.data;

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', formData.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            await login(userData);

            let title = 'Strive - Home';
            if (userData.role && userData.role.toUpperCase() === 'ADMIN') {
                title = 'Strive - Admin';
                navigate('/admin');
            } else if (userData.role && userData.role.toUpperCase() === 'MANAGER') {
                title = 'Strive - Manager';
                navigate('/manager');
            } else {
                navigate('/');
            }
            document.title = title;

        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                const errorStatus = error.response.status;
                if (errorStatus === 401) {
                    setErrors({ submit: 'Invalid credentials' });
                } else {
                    setErrors({ submit: 'Network error' });
                }
            } else {
                setErrors({ submit: 'Network error' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        wrapper: {
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            background: `url("https://images.pexels.com/photos/71104/utah-mountain-biking-bike-biking-71104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            overflow: 'hidden',
            marginTop: isMobile ? '-40px' : '-32px',
            marginBottom: '-24px',
        },
        formWrapper: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: '100%',
            padding: isMobile ? '20px' : '40px',
            paddingRight: isMobile ? '20px' : '10%',
        },
        formContainer: {
            width: '100%',
            maxWidth: isMobile ? '100%' : '450px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '40px',
            marginLeft: isMobile ? '0' : 'auto',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        title: {
            fontSize: '32px',
            fontWeight: 500,
            color: '#1976d2',
            marginBottom: '24px',
            textAlign: 'center',
        },
        textField: {
            marginBottom: '16px',
            '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
            },
        },
        rememberMe: {
            marginBottom: '16px',
        },
        signInButton: {
            padding: '12px',
            fontSize: '16px',
            fontWeight: 600,
            textTransform: 'uppercase',
            marginBottom: '16px',
            backgroundColor: '#1976d2',
            '&:hover': {
                backgroundColor: '#1565c0',
            },
        },
        signUpLink: {
            textAlign: 'center',
            '& a': {
                color: '#1976d2',
                textDecoration: 'none',
                '&:hover': {
                    textDecoration: 'underline',
                },
            },
        },
        errorMessage: {
            backgroundColor: '#fdeded',
            color: '#7d4747',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 500,
            border: '1px solid #fccfcf',
        },
    };

    return (
        <>
            <Helmet>
                <title>Strive - Login</title>
            </Helmet>
        <Box sx={styles.wrapper}>
            <Box sx={styles.formWrapper}>
                <Box sx={styles.formContainer}>
                    <Typography sx={styles.title}>
                        Welcome Back
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        {errors.submit && (
                            <Box sx={styles.errorMessage}>
                                {getErrorMessage(errors.submit)}
                            </Box>
                        )}

                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email && getErrorMessage(errors.email)}
                            sx={{
                                ...styles.textField,
                                '& .MuiFormHelperText-root': {
                                    marginLeft: 0,
                                    marginTop: '8px',
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password && getErrorMessage(errors.password)}
                            sx={{
                                ...styles.textField,
                                '& .MuiFormHelperText-root': {
                                    marginLeft: 0,
                                    marginTop: '8px',
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Remember me"
                            sx={styles.rememberMe}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={isLoading}
                            sx={styles.signInButton}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>

                        <Box sx={styles.signUpLink}>
                            <Link href="/register">
                                Don't have an account? Sign up
                            </Link>
                        </Box>
                    </form>
                </Box>
            </Box>
        </Box>
            </>
    );
};

export default Login;