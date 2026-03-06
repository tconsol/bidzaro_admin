import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  ShoppingCart, 
  MessageSquare, 
  UtensilsCrossed,
  CreditCard,
  Shield,
  ChevronRight,
  PanelLeftClose,
  Settings,
  FileText,
  Megaphone,
  X
} from 'lucide-react';
import logoFull from '../assets/bidzaro_logof.png';
import favicon from '../assets/favicon.png';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobileOpen?: boolean;
  closeMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, isMobileOpen, closeMobile }) => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/support-agents', icon: Users, label: 'Support Agents' },
    { path: '/vendors', icon: Store, label: 'Vendors' },
    { path: '/admins', icon: Shield, label: 'Admins' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/bids', icon: MessageSquare, label: 'Bids' },
    { path: '/menu-items', icon: UtensilsCrossed, label: 'Menu Items' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/platform-config', icon: Settings, label: 'Platform Config' },
    { path: '/audit-logs', icon: FileText, label: 'Audit Logs' },
    { path: '/announcements', icon: Megaphone, label: 'Announcements' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <div 
        className={`h-screen bg-gray-950 text-white fixed left-0 top-0 shadow-2xl border-r border-white/5 z-40 transition-all duration-300 flex flex-col
          ${isOpen ? 'w-64' : 'w-20'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
      {/* Fixed: Logo + Toggle Button */}
      <div className={`${isOpen ? 'p-6 pb-2' : 'p-4 pb-2'} flex-shrink-0 transition-all duration-300`}>
        {/* Logo Section */}
        <div className="mb-4">
          <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
            <div className={`flex items-center gap-3 ${isOpen ? '' : 'justify-center'}`}>
              {isOpen ? (
                <img src={logoFull} alt="Bidzaro" className="h-9 w-auto object-contain" />
              ) : (
                <img src={favicon} alt="Bidzaro" className="w-10 h-10 object-contain" />
              )}
            </div>
            {/* Mobile close button */}
            {isOpen && closeMobile && (
              <button onClick={closeMobile} className="lg:hidden text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Toggle Button — desktop only */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex w-full mb-2 p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 items-center justify-center group"
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <PanelLeftClose 
            className={`w-5 h-5 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`} 
          />
          {isOpen && <span className="ml-2 text-sm font-medium">Collapse</span>}
        </button>
      </div>

      {/* Scrollable: Navigation + Bottom Section */}
      <div className={`flex-1 overflow-y-auto sidebar-scroll ${isOpen ? 'px-6 pb-6' : 'px-4 pb-4'} transition-all duration-300`}>
        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={!isOpen ? item.label : ''}
              onClick={closeMobile}
              className={({ isActive }) =>
                `group flex items-center ${isOpen ? 'justify-between px-4' : 'justify-center px-3'} py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center ${isOpen ? 'space-x-3' : ''}`}>
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-orange-400' : 'text-gray-400 group-hover:text-white'
                    } transition-colors`} />
                    {isOpen && (
                      <span className={`text-sm font-medium whitespace-nowrap ${
                        isActive ? 'text-orange-300' : 'group-hover:text-white'
                      } transition-colors`}>{item.label}</span>
                    )}
                  </div>
                  {isActive && isOpen && (
                    <ChevronRight className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        {isOpen && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Need Help?</p>
              <p className="text-sm font-medium text-white mb-3">Check documentation</p>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200">
                View Docs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Sidebar;
