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
    FormControlLabel,
    Checkbox,
    CircularProgress,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { mockUsers } from '../mockData/Users.js';

const NAVBAR_HEIGHT = 64;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setEmailError('');

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            setIsLoading(false);
            return;
        }

        try {
            const user = mockUsers.find(
                (u) => u.email === email && u.password === password
            );

            if (user) {
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                await login(user);
                navigate(user.role === 'admin' ? '/admin' : '/');
            } else {
                setError('Invalid email or password');
            }
        } catch (error) {
            setError('An error occurred during login. Please try again.');
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
            backgroundImage: 'url("https://i.pinimg.com/736x/52/d0/85/52d085140048682cc644e767f57cbccc.jpg")',
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
            {/* Image section */}
            <Grid
                item
                xs={12}
                md={6}
                sx={styles.imageSection}
            />

            {/* Login form section */}
            <Grid
                item
                xs={12}
                md={6}
                sx={styles.formSection}
            >
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
                                Login
                            </Typography>
                        </Box>

                        <form onSubmit={handleSubmit} noValidate>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={!!emailError}
                                helperText={emailError}
                                margin="dense"
                                sx={{ mb: 2 }}
                                required
                                disabled={isLoading}
                                inputProps={{
                                    autoComplete: 'email'
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                margin="dense"
                                sx={{ mb: 2 }}
                                required
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
                                    autoComplete: 'current-password'
                                }}
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        color="primary"
                                        disabled={isLoading}
                                    />
                                }
                                label="Remember me"
                                sx={{ mt: 2 }}
                            />

                            {error && (
                                <Typography color="error" sx={{ mt: 2 }}>
                                    {error}
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
                                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'LOGIN'}
                            </Button>

                            <Box sx={{ mt: 3, textAlign: 'center', fontSize: isMobile ? '1rem' : '1.1rem' }}>
                                <Link
                                    href="/register"
                                    variant="body2"
                                    sx={{
                                        textDecoration: 'none',
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    Don't have an account? Sign up
                                </Link>
                            </Box>
                        </form>
                    </Paper>
                </Container>
            </Grid>
        </Grid>
    );
};

export default Login;