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
import {mockUsers} from "../mockData/Users";

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
            setFormData(prev => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
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
        } else if (formData.password.length < 6) {
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
            const foundUser = mockUsers.find(
                user => user.email === formData.email && user.password === formData.password
            );

            if (!foundUser) {
                setErrors({ submit: 'Invalid credentials' });
                return;
            }

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', formData.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            await login(foundUser);

            if (foundUser.role === 'admin') {
                navigate('/admin');
            }else if (foundUser.role === 'manager') {
                navigate('/manager');
            }else {
                navigate('/');
            }

        } catch (error) {
            console.error('Login error:', error);
            setErrors({
                submit: 'Network error'
            });
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
                                            onClick={() => setShowPassword(!showPassword)}
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
    );
};

export default Login;