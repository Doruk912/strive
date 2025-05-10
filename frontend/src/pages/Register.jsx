import React, { useState, useEffect, useRef } from 'react';
import {
    TextField,
    Button,
    Typography,
    Box,
    Link,
    CircularProgress,
    useTheme,
    useMediaQuery,
    InputAdornment,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Fade,
    Popper,
} from '@mui/material';
import { Visibility, VisibilityOff, Check, Close } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import {Helmet} from "react-helmet";
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showCriteria, setShowCriteria] = useState(false);

    // Password strength criteria states
    const [passwordCriteria, setPasswordCriteria] = useState({
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasMinLength: false,
    });

    // Ref for password input field
    const passwordFieldRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const { login } = useAuth();
    
    // Get the redirect path from location state or default to home
    const from = location.state?.from || '/';

    // Determine the popper placement based on screen size
    const popperPlacement = isMobile ? 'bottom' : 'right-start';

    // Check if all password criteria are met
    const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);

    // Check password strength whenever password changes
    useEffect(() => {
        const password = formData.password;
        setPasswordCriteria({
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasMinLength: password.length >= 6,
        });

        // Show criteria popup when user starts typing password
        if (password && !showCriteria) {
            setShowCriteria(true);
        } else if (!password) {
            setShowCriteria(false);
        }
    }, [formData.password]);

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
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Enforce all password criteria
        if (!allCriteriaMet) {
            newErrors.password = 'Password must meet all criteria';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsLoading(true);
        try {
            // Register the user
            const registerResponse = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                }),
            });

            if (!registerResponse.ok) {
                const data = await registerResponse.text();
                throw new Error(data || 'Registration failed');
            }

            // Registration successful, now log in the user automatically
            const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!loginResponse.ok) {
                throw new Error('Registration successful but automatic login failed. Please login manually.');
            }

            const loginData = await loginResponse.json();

            // Use AuthContext login function instead of directly manipulating localStorage
            login(loginData);

            // Redirect to the original page they were trying to access or home if none specified
            navigate(from);
        } catch (error) {
            setErrors({ submit: error.message || 'Registration failed' });
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate the position for the arrow based on placement
    const getArrowStyles = () => {
        if (isMobile) {
            return {
                position: 'absolute',
                width: '12px',
                height: '12px',
                backgroundColor: 'white',
                transform: 'rotate(45deg)',
                top: '-6px',
                left: '50%',
                marginLeft: '-6px',
                boxShadow: '0px -1px 2px rgba(0, 0, 0, 0.1)',
                zIndex: 0,
            };
        } else {
            return {
                position: 'absolute',
                width: '12px',
                height: '12px',
                backgroundColor: 'white',
                transform: 'rotate(45deg)',
                left: '-6px',
                top: '20px',
                boxShadow: '-1px 1px 2px rgba(0, 0, 0, 0.1)',
                zIndex: 0,
            };
        }
    };

    const styles = {
        wrapper: {
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            background: `url("https://images.pexels.com/photos/3193846/pexels-photo-3193846.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
            paddingTop: '32px',
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
            maxWidth: isMobile ? '100%' : '500px',
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
        signUpButton: {
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
            '& a': {
                color: '#1976d2',
                textDecoration: 'none',
                '&:hover': {
                    textDecoration: 'underline',
                },
            },
        },
        criteriaPopper: {
            zIndex: 1300,
            width: isMobile ? '100%' : 280,
            maxWidth: isMobile ? 'calc(100vw - 40px)' : 280,
        },
        criteriaPaper: {
            padding: '8px 0',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            position: 'relative',
            overflow: 'hidden',
        },
        criteriaList: {
            padding: '0 8px',
        },
        criteriaItem: {
            padding: '4px 8px',
            minHeight: '32px',
        },
        criteriaIcon: {
            minWidth: '28px',
        },
        criteriaText: {
            fontSize: '0.775rem',
            margin: 0,
        },
    };

    return (
        <>
            <Helmet>
                <title>Strive - Register</title>
            </Helmet>
            <Box sx={styles.wrapper}>
                <Box sx={styles.formWrapper}>
                    <Box sx={styles.formContainer}>
                        <Typography sx={styles.title}>
                            Create Account
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                                sx={styles.textField}
                            />

                            <TextField
                                fullWidth
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                                sx={styles.textField}
                            />

                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                sx={styles.textField}
                            />

                            <Box position="relative">
                                <TextField
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    sx={styles.textField}
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
                                    inputRef={passwordFieldRef}
                                />

                                {/* Password Criteria Popper */}
                                <Popper
                                    open={showCriteria && !!formData.password}
                                    anchorEl={passwordFieldRef.current}
                                    placement={popperPlacement}
                                    transition
                                    sx={styles.criteriaPopper}
                                    modifiers={[
                                        {
                                            name: 'offset',
                                            options: {
                                                offset: isMobile ? [0, 10] : [5, 0],
                                            },
                                        },
                                        {
                                            name: 'preventOverflow',
                                            options: {
                                                boundary: document.body,
                                                padding: 16,
                                            },
                                        },
                                        {
                                            name: 'flip',
                                            enabled: true,
                                            options: {
                                                altBoundary: true,
                                                fallbackPlacements: isMobile ? ['top'] : ['left', 'bottom-end'],
                                            },
                                        },
                                    ]}
                                >
                                    {({ TransitionProps }) => (
                                        <Fade {...TransitionProps} timeout={300}>
                                            <Paper sx={styles.criteriaPaper} elevation={4}>
                                                <Box sx={getArrowStyles()} />
                                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                                    <Typography variant="subtitle2" sx={{ p: 1, fontWeight: 600 }}>
                                                        Password requirements:
                                                    </Typography>
                                                    <List dense sx={styles.criteriaList}>
                                                        <ListItem sx={styles.criteriaItem}>
                                                            <ListItemIcon sx={styles.criteriaIcon}>
                                                                {passwordCriteria.hasUpperCase ?
                                                                    <Check fontSize="small" color="success" /> :
                                                                    <Close fontSize="small" color="error" />}
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary="Contains uppercase letter"
                                                                primaryTypographyProps={{
                                                                    sx: {
                                                                        ...styles.criteriaText,
                                                                        color: passwordCriteria.hasUpperCase ? 'green' : 'red'
                                                                    }
                                                                }}
                                                            />
                                                        </ListItem>
                                                        <ListItem sx={styles.criteriaItem}>
                                                            <ListItemIcon sx={styles.criteriaIcon}>
                                                                {passwordCriteria.hasLowerCase ?
                                                                    <Check fontSize="small" color="success" /> :
                                                                    <Close fontSize="small" color="error" />}
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary="Contains lowercase letter"
                                                                primaryTypographyProps={{
                                                                    sx: {
                                                                        ...styles.criteriaText,
                                                                        color: passwordCriteria.hasLowerCase ? 'green' : 'red'
                                                                    }
                                                                }}
                                                            />
                                                        </ListItem>
                                                        <ListItem sx={styles.criteriaItem}>
                                                            <ListItemIcon sx={styles.criteriaIcon}>
                                                                {passwordCriteria.hasNumber ?
                                                                    <Check fontSize="small" color="success" /> :
                                                                    <Close fontSize="small" color="error" />}
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary="Contains number"
                                                                primaryTypographyProps={{
                                                                    sx: {
                                                                        ...styles.criteriaText,
                                                                        color: passwordCriteria.hasNumber ? 'green' : 'red'
                                                                    }
                                                                }}
                                                            />
                                                        </ListItem>
                                                        <ListItem sx={styles.criteriaItem}>
                                                            <ListItemIcon sx={styles.criteriaIcon}>
                                                                {passwordCriteria.hasMinLength ?
                                                                    <Check fontSize="small" color="success" /> :
                                                                    <Close fontSize="small" color="error" />}
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary="At least 6 characters long"
                                                                primaryTypographyProps={{
                                                                    sx: {
                                                                        ...styles.criteriaText,
                                                                        color: passwordCriteria.hasMinLength ? 'green' : 'red'
                                                                    }
                                                                }}
                                                            />
                                                        </ListItem>
                                                    </List>
                                                </Box>
                                            </Paper>
                                        </Fade>
                                    )}
                                </Popper>
                            </Box>

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                sx={styles.textField}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {errors.submit && (
                                <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
                                    {errors.submit}
                                </Typography>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={isLoading ||
                                    (formData.password && !allCriteriaMet)}
                                sx={styles.signUpButton}
                            >
                                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                            </Button>

                            <Box sx={styles.loginLink}>
                                <Link href="/login">
                                    Already have an account? Sign in
                                </Link>
                            </Box>
                        </form>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default Register;