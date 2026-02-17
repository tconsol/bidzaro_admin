import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Search, ChevronDown, Menu, X, Home, ShoppingCart, Users, Store, Package, CreditCard, Gavel, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  toggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isSidebarOpen, toggleMobileMenu, isMobileMenuOpen }) => {
  const { admin, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Store, label: 'Vendors', path: '/vendors' },
    { icon: Package, label: 'Menu Items', path: '/menu-items' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: Gavel, label: 'Bids', path: '/bids' },
    { icon: Shield, label: 'Admins', path: '/admins' },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // TODO: Implement global search functionality
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleMobileNavigation = (path: string) => {
    navigate(path);
    toggleMobileMenu();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const leftClass = isSidebarOpen ? 'lg:left-[16rem]' : 'lg:left-[5rem]';

  return (
    <>
      <header
        className={`bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 fixed top-0 right-0 z-20 transition-all duration-300 left-0 ${leftClass}`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
          {/* Mobile Logo & Brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CaterBid
            </span>
          </div>

          {/* Desktop Search Section */}
          <div className="hidden lg:flex flex-1 max-w-2xl">
            <div className="relative flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search anything... (Press Enter)"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span className="hidden xl:inline">Search</span>
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Divider - Desktop only */}
            <div className="hidden lg:block h-8 w-px bg-gray-200 ml-4"></div>

            {/* Desktop User Menu */}
            <div className="hidden lg:block relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100/50 px-4 py-2 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-200"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {admin?.firstName} {admin?.lastName}
                  </p>
                  <p className="text-xs font-medium text-gray-500">{admin?.userType?.replace('_', ' ')}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-slideDown">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  CaterBid
                </span>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-xl hover:bg-white/50 text-gray-600 hover:text-blue-600 transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {admin?.firstName} {admin?.lastName}
                </p>
                <p className="text-xs font-medium text-gray-500">{admin?.userType?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search anything..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleMobileNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => {
                navigate('/profile');
                toggleMobileMenu();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">My Profile</span>
            </button>
            <button
              onClick={() => {
                logout();
                toggleMobileMenu();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
