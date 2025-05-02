import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Typography,
    Box,
    Link,
    CircularProgress,
    useTheme,
    useMediaQuery,
    Alert,
    Paper,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [error, setError] = useState('');
    const [token, setToken] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        // Extract token from URL query parameters
        const params = new URLSearchParams(location.search);
        const tokenParam = params.get('token');
        
        if (!tokenParam) {
            setError('Invalid or missing reset token');
        } else {
            setToken(tokenParam);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate password
        if (!newPassword) {
            setError('Please enter a new password');
            return;
        }
        
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            await axios.post('http://localhost:8080/api/auth/reset-password', {
                token,
                newPassword
            });
            
            setResetSuccess(true);
            
            // Redirect to login page after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
            
        } catch (error) {
            console.error('Password reset error:', error);
            
            if (error.response && error.response.status === 400) {
                setError(error.response.data);
            } else {
                setError('An error occurred. Please try again or request a new reset link.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleToggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
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
            fontSize: '24px',
            fontWeight: 500,
            color: '#1976d2',
            marginBottom: '16px',
            textAlign: 'center',
        },
        subtitle: {
            fontSize: '16px',
            color: '#666',
            marginBottom: '24px',
            textAlign: 'center',
        },
        textField: {
            marginBottom: '20px',
        },
        button: {
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
        loginLink: {
            textAlign: 'center',
            marginTop: '16px',
            '& a': {
                color: '#1976d2',
                textDecoration: 'none',
                '&:hover': {
                    textDecoration: 'underline',
                },
            },
        },
    };

    if (!token && !resetSuccess) {
        return (
            <>
                <Helmet>
                    <title>Strive - Reset Password</title>
                </Helmet>
                <Box sx={styles.wrapper}>
                    <Box sx={styles.formWrapper}>
                        <Paper sx={styles.formContainer}>
                            <Typography sx={styles.title}>
                                Reset Password
                            </Typography>
                            <Alert severity="error" sx={{ mb: 2 }}>
                                Invalid or missing reset token. Please request a new password reset link.
                            </Alert>
                            <Box sx={styles.loginLink}>
                                <Link href="/forgot-password">
                                    Request New Reset Link
                                </Link>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Strive - Reset Password</title>
            </Helmet>
            <Box sx={styles.wrapper}>
                <Box sx={styles.formWrapper}>
                    <Paper sx={styles.formContainer}>
                        <Typography sx={styles.title}>
                            Reset Password
                        </Typography>
                        
                        {!resetSuccess ? (
                            <>
                                <Typography sx={styles.subtitle}>
                                    Enter your new password below.
                                </Typography>

                                {error && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <TextField
                                        fullWidth
                                        label="New Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        sx={styles.textField}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleTogglePassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        sx={styles.textField}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleToggleConfirmPassword}
                                                        edge="end"
                                                    >
                                                        {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        disabled={isLoading}
                                        sx={styles.button}
                                    >
                                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <>
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Your password has been successfully reset! You'll be redirected to login.
                                </Alert>
                                <CircularProgress sx={{ display: 'block', margin: '0 auto' }} />
                            </>
                        )}

                        <Box sx={styles.loginLink}>
                            <Link href="/login">
                                Back to Login
                            </Link>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </>
    );
};

export default ResetPassword; 