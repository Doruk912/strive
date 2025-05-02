import React, { useState } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');
        
        try {
            await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            setEmailSent(true);
        } catch (error) {
            console.error('Password reset request error:', error);
            setError('An error occurred. Please try again later.');
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

    return (
        <>
            <Helmet>
                <title>Strive - Forgot Password</title>
            </Helmet>
            <Box sx={styles.wrapper}>
                <Box sx={styles.formWrapper}>
                    <Paper sx={styles.formContainer}>
                        <Typography sx={styles.title}>
                            Forgot Password
                        </Typography>
                        
                        {!emailSent ? (
                            <>
                                <Typography sx={styles.subtitle}>
                                    Enter your email address and we'll send you a link to reset your password.
                                </Typography>

                                {error && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        sx={styles.textField}
                                        error={!!error}
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
                            <Alert severity="success" sx={{ mb: 2 }}>
                                If the email exists in our system, you will receive a password reset link shortly. Please check your inbox.
                            </Alert>
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

export default ForgotPassword; 