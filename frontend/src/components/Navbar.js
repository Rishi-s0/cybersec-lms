import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, User, LogOut, BookOpen, Home, Map, Wrench, Globe, Terminal, Menu, X, Search } from 'lucide-react';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';
import MobileSearchBar from './MobileSearchBar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  // Navigation items based on user role
  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/admin', icon: Shield, label: 'Admin Panel' },
        { path: '/threat-map', icon: Globe, label: 'Threat Map' },
        { path: '/tools', icon: Wrench, label: 'Tools' },
      ];
    } else {
      // Student or no user
      return [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/courses', icon: BookOpen, label: 'Courses' },
        { path: '/roadmap', icon: Map, label: 'Roadmap' },
        { path: '/tools', icon: Wrench, label: 'Tools' },
        { path: '/threat-map', icon: Globe, label: 'Threat Map' },
        { path: '/labs', icon: Terminal, label: 'Labs' },
      ];
    }
  };

  const navItems = getNavItems();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const NavLink = ({ to, icon: Icon, children, mobile = false }) => {
    const active = isActive(to);
    const baseClasses = mobile
      ? "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
      : "flex items-center space-x-2 font-medium transition-all duration-300 px-3 py-2 rounded-lg";

    const activeClasses = active
      ? "text-htb-green bg-htb-green/10"
      : "text-htb-gray hover:text-htb-green hover:bg-htb-darker/30";

    return (
      <Link
        to={to}
        onClick={() => setIsMenuOpen(false)}
        className={`${baseClasses} ${activeClasses}`}
      >
        <Icon className={mobile ? "h-5 w-5" : "h-4 w-4"} />
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <nav className="bg-htb-dark/95 backdrop-blur-md border-b border-htb-gray-dark/50 sticky top-0 z-[100] print:hidden">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group z-[110]" onClick={() => setIsMenuOpen(false)}>
            <Shield className="h-8 w-8 text-htb-green group-hover:text-htb-green-light transition-colors" />
            <span className="text-xl font-bold text-htb-gray-light">
              HACK<span className="htb-gradient">ADEMY</span>
            </span>
          </Link>

          {/* HIDDEN ON MOBILE: Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* HIDDEN ON MOBILE: Desktop User/Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <NotificationBell />

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-htb-gray hover:text-htb-green transition-colors font-medium px-3 py-2 rounded-lg hover:bg-htb-darker/30">
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 htb-card rounded-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-htb-gray hover:text-htb-green hover:bg-htb-darker/50 transition-colors">Profile</Link>
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-htb-gray hover:text-htb-green hover:bg-htb-darker/50 transition-colors">Dashboard</Link>
                    <Link to="/certificates" className="block px-4 py-2 text-sm text-htb-gray hover:text-htb-green hover:bg-htb-darker/50 transition-colors">My Certificates</Link>
                    <div className="border-t border-htb-gray-dark/30 my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-htb-red hover:text-htb-red-light hover:bg-htb-darker/50 flex items-center space-x-2 transition-colors">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-htb-gray hover:text-htb-green transition-colors font-medium">Login</Link>
                <Link to="/register" className="htb-btn-primary px-6 py-2 rounded-lg transition-all font-medium">Get Started</Link>
              </>
            )}
          </div>

          {/* MOBILE ONLY: Search & Menu Buttons */}
          <div className="md:hidden flex items-center space-x-2 z-[110]">
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="text-htb-gray hover:text-white focus:outline-none p-2"
            >
              <Search className="h-5 w-5" />
            </button>
            {user && <div className=""><NotificationBell /></div>}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-htb-gray hover:text-white focus:outline-none p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[90] bg-htb-dark/95 backdrop-blur-xl pt-20 px-4 h-screen overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {/* Mobile Nav Items */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2">Menu</h3>
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path} icon={item.icon} mobile={true}>
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Mobile User/Auth */}
            <div className="pt-4 border-t border-htb-gray-dark/30">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2">Account</h3>
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 flex items-center space-x-3 text-htb-gray-light">
                    <div className="bg-htb-green/20 p-2 rounded-full">
                      <User className="h-5 w-5 text-htb-green" />
                    </div>
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-xs text-htb-gray">{user.email}</p>
                    </div>
                  </div>
                  <NavLink to="/profile" icon={User} mobile={true}>Profile</NavLink>
                  <NavLink to="/dashboard" icon={Home} mobile={true}>Dashboard</NavLink>
                  <NavLink to="/certificates" icon={BookOpen} mobile={true}>My Certificates</NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-htb-red hover:bg-htb-red/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center py-3 rounded-lg border border-htb-gray-dark text-htb-gray hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center py-3 rounded-lg htb-btn-primary"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Overlay */}
      <MobileSearchBar 
        isOpen={isMobileSearchOpen} 
        onClose={() => setIsMobileSearchOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;