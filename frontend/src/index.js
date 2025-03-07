import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FavoritesProvider } from './context/FavoritesContext'; // Import FavoritesProvider

// Create the root for React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app with FavoritesProvider
root.render(
    <React.StrictMode>
        <FavoritesProvider>
            <App />
        </FavoritesProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();