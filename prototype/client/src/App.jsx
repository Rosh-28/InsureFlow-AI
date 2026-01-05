import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';

// Layouts
import UserLayout from './components/layouts/UserLayout';
import AdminLayout from './components/layouts/AdminLayout';

// User Pages
import Login from './pages/Login';
import UserDashboard from './pages/user/Dashboard';
import ApplyClaim from './pages/user/ApplyClaim';
import StatusTracker from './pages/user/StatusTracker';
import ClaimDetail from './pages/user/ClaimDetail';
import Help from './pages/user/Help';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminClaims from './pages/admin/Claims';
import AdminClaimReview from './pages/admin/ClaimReview';
import Analytics from './pages/admin/Analytics';

// Auth Context
export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Login failed');
    }
    
    localStorage.setItem('user', JSON.stringify(data.data.user));
    localStorage.setItem('token', data.data.token);
    setUser(data.data.user);
    
    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={
            user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />
          } />

          {/* User Routes */}
          <Route path="/" element={
            user?.role === 'user' ? <UserLayout /> : <Navigate to="/login" />
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="apply" element={<ApplyClaim />} />
            <Route path="claims" element={<StatusTracker />} />
            <Route path="claims/:id" element={<ClaimDetail />} />
            <Route path="help" element={<Help />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/login" />
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="claims" element={<AdminClaims />} />
            <Route path="claims/:id" element={<AdminClaimReview />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
