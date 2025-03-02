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
    InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NAVBAR_HEIGHT = 64; {/* navbar yüksekliği */}

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            console.log('Registration data:', formData);
            navigate('/login');
        } catch (err) {
            setError('An error occurred during registration');
        }
    };

    return (
        <Grid container sx={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, margin: 0, padding: 0, overflow: 'hidden' }}> {/*Sayfanın yüksekliğini ekranın tamamına (100vh) ayarlar, ancak navbar yüksekliğini (NAVBAR_HEIGHT) çıkararak geri kalan alanı kaplamasını sağlar.*/}
            {/*image on left */}
            <Grid item xs={12} md={6} sx={{
                backgroundImage: 'url("https://i.pinimg.com/736x/82/2b/32/822b32b2cce1af8df475ce0eed27e704.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                display: 'flex',
                justifyContent: 'flex-end'
            }}>
            </Grid>
            
            {/*register form on right */}
            <Grid item xs={12} md={6} display="flex" justifyContent="flex-start" alignItems="center" sx={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, paddingLeft: '20px' }}>
                <Container maxWidth="sm">
                    <Paper elevation={6} sx={{ p: 6, textAlign: 'center', width: '520px', borderRadius: '12px', backgroundColor: '#fafafa', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <img src="/logo192.png" alt="Logo" style={{ width: 60, height: 60, marginBottom: 15 }} />
                            <Typography variant="h3" fontWeight="bold" color="#1565C0" gutterBottom>
                                Register
                            </Typography>
                        </Box>

                        <form onSubmit={handleSubmit}>
                            <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} margin="dense" sx={{ mb: 2 }} required />
                            <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} margin="dense" sx={{ mb: 2 }} required />
                            <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} margin="dense" sx={{ mb: 2 }} required />
                            
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
                                InputProps={{
                                    sx: { paddingRight: '12px' },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
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
                                InputProps={{
                                    sx: { paddingRight: '12px' },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            
                            {error && (
                                <Typography color="error" sx={{ mt: 2 }}>
                                    {error}
                                </Typography>
                            )}
                            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 4, p: 2, fontSize: '1.2rem', borderRadius: '8px', fontWeight: 'bold', backgroundColor: '#1565C0', '&:hover': { backgroundColor: '#0D47A1' } }}>
                                REGISTER
                            </Button>
                            <Box sx={{ mt: 3, textAlign: 'center', fontSize: '1.1rem' }}>
                                <Link href="/login" variant="body2">Already have an account? Sign in</Link>
                            </Box>
                        </form>
                    </Paper>
                </Container>
            </Grid>
        </Grid>
    );
};

export default Register;
