import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button, Box } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';

const GoogleLoginButton = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Get user info from Google
                const userInfoResponse = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );
                
                const userInfo = userInfoResponse.data;
                
                // Send Google token and user data to our backend
                const response = await axios.post('http://localhost:8080/api/auth/google-login', {
                    tokenId: tokenResponse.access_token,
                    email: userInfo.email,
                    firstName: userInfo.given_name,
                    lastName: userInfo.family_name,
                    imageUrl: userInfo.picture
                });

                if (response.status !== 200) {
                    throw new Error('Failed to login with Google');
                }

                const userData = response.data;

                // Store user data
                await login(userData);

                // Navigate based on user role
                if (userData.role && userData.role.toUpperCase() === 'ADMIN') {
                    navigate('/admin');
                } else if (userData.role && userData.role.toUpperCase() === 'MANAGER') {
                    navigate('/manager');
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Google login error:', error);
            }
        },
        onError: error => console.error('Google login failed:', error)
    });

    return (
        <Box>
            <Button
                variant="contained"
                fullWidth
                onClick={() => handleGoogleLogin()}
                sx={{
                    backgroundColor: '#ffffff',
                    color: '#757575',
                    border: '1px solid #DADCE0',
                    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                    marginTop: '16px',
                    marginBottom: '16px',
                    padding: '10px 24px',
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    '&:hover': {
                        backgroundColor: '#f5f5f5',
                        boxShadow: '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
                    }
                }}
                startIcon={<GoogleIcon />}
            >
                Sign in with Google
            </Button>
        </Box>
    );
};

export default GoogleLoginButton;