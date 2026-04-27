import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Storefront } from './Storefront';
import { AdminDashboard } from './Admin';
import { Login } from './Login';
import { Register } from './Register';
import { ProductPage } from './ProductPage';
import { UserProfile } from './UserProfile';
import { CheckoutPage } from './CheckoutPage';
import { CartPage } from './CartPage';
import { DevDashboard } from './DevDashboard';
import { MaintenanceMode } from './MaintenanceMode';
import { getCurrentUser, getStoreConfig } from './lib/storage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  const isAdmin = user?.role === 'admin';
  return isAdmin ? <>{children}</> : <Navigate to="/login" />;
};

const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  if (user?.role === 'dev') return <Navigate to="/dev-control" />;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const DevRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  const isDev = user?.role === 'dev';
  return isDev ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  const [storeConfig, setStoreConfig] = React.useState(getStoreConfig());
  const [user, setUser] = React.useState(getCurrentUser());

  React.useEffect(() => {
    const handleUpdate = () => setStoreConfig(getStoreConfig());
    const handleAuth = () => setUser(getCurrentUser());

    window.addEventListener('storeConfigUpdated', handleUpdate);
    window.addEventListener('authUpdated', handleAuth);

    return () => {
      window.removeEventListener('storeConfigUpdated', handleUpdate);
      window.removeEventListener('authUpdated', handleAuth);
    };
  }, []);

  const isMaintenance = !!storeConfig.maintenance?.enabled;
  const isDev = user?.role === 'dev';

  // Se estiver em manutenção e NÃO for dev, mostra a tela de manutenção (Bloqueio Total)
  if (isMaintenance && !isDev) {
    return <MaintenanceMode time={storeConfig.maintenance?.time} reason={storeConfig.maintenance?.reason} />;
  }

  return (
    <Router>
      {/* Redirecionamento automático para Dev se logado durante manutenção */}
      {isMaintenance && isDev && window.location.pathname === '/' && <Navigate to="/dev-control" replace />}
      
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<CartPage />} />
        <Route 
          path="/profile" 
          element={
            <UserRoute>
              <UserProfile />
            </UserRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <UserRoute>
              <CheckoutPage />
            </UserRoute>
          } 
        />
        <Route 
          path="/manager" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dev-control" 
          element={
            <DevRoute>
              <DevDashboard />
            </DevRoute>
          } 
        />
      </Routes>
    </Router>
  );
}
