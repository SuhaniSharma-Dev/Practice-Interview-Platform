import { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext — manages authentication state across the application.
 * Persists user data and JWT token in localStorage.
 */
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  /** Login — store token and user data */
  const login = (authResponse) => {
    const userData = {
      id: authResponse.userId,
      name: authResponse.name,
      email: authResponse.email,
      role: authResponse.role,
    };
    setToken(authResponse.token);
    setUser(userData);
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /** Logout — clear all auth state */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /** Check if user is authenticated */
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
