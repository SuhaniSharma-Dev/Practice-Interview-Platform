import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Zap, LayoutDashboard, Calendar, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  const navLink = (to, label, icon) => (
    <Link to={to} onClick={() => setMenuOpen(false)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
        isActive(to) ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
          : 'text-surface-300 hover:text-white hover:bg-white/5'
      }`}>
      {icon}{label}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-surface-300 bg-clip-text text-transparent">
              InterviewMatch
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {navLink('/dashboard', 'Dashboard', <LayoutDashboard className="w-4 h-4" />)}
                {navLink('/sessions', 'My Sessions', <Calendar className="w-4 h-4" />)}
                {navLink('/profile', 'Profile', <User className="w-4 h-4" />)}

                <div className="ml-4 flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{user?.name}</div>
                    <div className="text-xs text-surface-400">{user?.role}</div>
                  </div>
                  <button onClick={handleLogout}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all" title="Logout">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-5">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5 text-surface-300">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            <div className="flex flex-col gap-1">
              {isAuthenticated ? (
                <>
                  {navLink('/dashboard', 'Dashboard', <LayoutDashboard className="w-4 h-4" />)}
                  {navLink('/sessions', 'My Sessions', <Calendar className="w-4 h-4" />)}
                  {navLink('/profile', 'Profile', <User className="w-4 h-4" />)}
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-surface-300 hover:text-white">Sign In</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-primary-400 font-medium">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
