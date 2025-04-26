import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FavoritesProvider } from './context/FavoritesContext'; // Import FavoritesProvider
import { GoogleOAuthProvider } from '@react-oauth/google';

// Create the root for React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app with FavoritesProvider and GoogleOAuthProvider
// Replace 'YOUR_GOOGLE_CLIENT_ID' with your actual Google Client ID
root.render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId="663361798035-2k2lcl0bl0g8v1gi6qmkt2oqlta8tjmj.apps.googleusercontent.com">
            <FavoritesProvider>
                <App />
            </FavoritesProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();