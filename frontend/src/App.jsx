import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import BrowsePage from './pages/BrowsePage';
import SessionsPage from './pages/SessionsPage';
import FeedbackPage from './pages/FeedbackPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(30, 41, 59, 0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
            },
          }}
        />
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/browse" element={<ProtectedRoute><BrowsePage /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
          <Route path="/feedback/:sessionId" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
          {/* Legacy route redirect */}
          <Route path="/matches" element={<Navigate to="/sessions" replace />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
