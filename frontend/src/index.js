import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
// Temporarily disabled socket provider to fix runtime errors
// import { SocketProvider } from './contexts/SocketContext';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {/* Temporarily disabled socket provider */}
          {/* <SocketProvider> */}
            <App />
          {/* </SocketProvider> */}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);