import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/Store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './shopping-cart/services/ServiceConstants';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        {/* <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> */}
        <App />
        {/* </GoogleOAuthProvider> */}
    </Provider>
);
