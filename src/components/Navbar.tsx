import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Search, ChevronDown, Menu, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  openMobileSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isSidebarOpen, openMobileSidebar }) => {
  const { admin, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSearch = () => {
    // TODO: Implement global search
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
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

  const leftClass = isSidebarOpen ? 'lg:left-64' : 'lg:left-20';

  return (
    <header className={`bg-white border-b border-gray-200 fixed top-0 right-0 z-20 transition-all duration-300 left-0 ${leftClass}`}>
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Mobile: hamburger + brand */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={openMobileSidebar}
            className="p-2 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-base font-bold text-gray-900">Bidzaro</span>
          </div>
        </div>

        {/* Desktop: Search */}
        <div className="hidden lg:flex flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-transparent rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all text-sm"
            />
          </div>
        </div>

        {/* Right: user menu */}
        <div className="flex items-center gap-3">
          {/* Mobile search icon */}
          <button className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-all">
            <Search className="w-5 h-5" />
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow">
                <User className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {admin?.firstName} {admin?.lastName}
                </p>
                <p className="text-xs text-gray-500 leading-tight">{admin?.userType?.replace('_', ' ')}</p>
              </div>
              <ChevronDown className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                <div className="sm:hidden px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-semibold text-gray-900">{admin?.firstName} {admin?.lastName}</p>
                  <p className="text-xs text-gray-500">{admin?.userType?.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  My Profile
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
