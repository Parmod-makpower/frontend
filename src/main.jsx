import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { getAllProducts } from '../src/api/productApi'; // ✅ import fetch function

const queryClient = new QueryClient();

// ✅ Prefetch products on app start
queryClient.prefetchQuery({
  queryKey: ['all-products'],
  queryFn: getAllProducts,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
