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
import { useAuth } from '../context/AuthContext.js';
import { mockUsers } from '../mockData/Users.js';

const NAVBAR_HEIGHT = 64; // Navbar yüksekliği

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const user = mockUsers.find(
            (u) => u.email === email && u.password === password
        );

        if (user) {
            login(user);
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            setError('Invalid email or password');
        }
    };

    return (
        <Grid container sx={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, margin: 0, padding: 0, overflow: 'hidden' }}>
            {/* Sol tarafta resim */}
            <Grid item xs={12} md={6} sx={{
                backgroundImage: 'url("https://i.pinimg.com/736x/52/d0/85/52d085140048682cc644e767f57cbccc.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                display: 'flex',
                justifyContent: 'flex-end'
            }}>
            </Grid>
            
            {/*login form on the right */}
            <Grid item xs={12} md={6} display="flex" justifyContent="flex-start" alignItems="center" sx={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, paddingLeft: '20px' }}>
                <Container maxWidth="sm">
                    <Paper elevation={6} sx={{ p: 6, textAlign: 'center', width: '520px', borderRadius: '12px', backgroundColor: '#fafafa', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <img src="/logo192.png" alt="Logo" style={{ width: 60, height: 60, marginBottom: 15 }} />
                            <Typography variant="h3" fontWeight="bold" color="#1565C0" gutterBottom>
                                Login
                            </Typography>
                        </Box>

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                margin="dense"
                                sx={{ mb: 2 }}
                                required
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
                                sx={{ mt: 4, p: 2, fontSize: '1.2rem', borderRadius: '8px', fontWeight: 'bold', backgroundColor: '#1565C0', '&:hover': { backgroundColor: '#0D47A1' } }}
                            >
                                LOGIN
                            </Button>

                            <Box sx={{ mt: 3, textAlign: 'center', fontSize: '1.1rem' }}>
                                <Link href="/register" variant="body2">
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

