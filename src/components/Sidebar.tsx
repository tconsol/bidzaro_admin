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
  Megaphone
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-blue-600' },
    { path: '/users', icon: Users, label: 'Users', color: 'from-green-500 to-green-600' },
    { path: '/support-agents', icon: Users, label: 'Support Agents', color: 'from-cyan-500 to-cyan-600' },
    { path: '/vendors', icon: Store, label: 'Vendors', color: 'from-purple-500 to-purple-600' },
    { path: '/admins', icon: Shield, label: 'Admins', color: 'from-indigo-500 to-indigo-600' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders', color: 'from-orange-500 to-orange-600' },
    { path: '/bids', icon: MessageSquare, label: 'Bids', color: 'from-pink-500 to-pink-600' },
    { path: '/menu-items', icon: UtensilsCrossed, label: 'Menu Items', color: 'from-red-500 to-red-600' },
    { path: '/payments', icon: CreditCard, label: 'Payments', color: 'from-emerald-500 to-emerald-600' },
    { path: '/platform-config', icon: Settings, label: 'Platform Config', color: 'from-yellow-500 to-yellow-600' },
    { path: '/audit-logs', icon: FileText, label: 'Audit Logs', color: 'from-cyan-500 to-cyan-600' },
    { path: '/announcements', icon: Megaphone, label: 'Announcements', color: 'from-rose-500 to-rose-600' },
  ];

  return (
    <div 
      className={`h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white fixed left-0 top-0 overflow-y-auto shadow-2xl border-r border-gray-700/50 z-30 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className={`${isOpen ? 'p-6' : 'p-4'} transition-all duration-300`}>
        {/* Logo Section */}
        <div className="mb-8">
          <div className={`flex items-center ${isOpen ? 'space-x-3' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Shield className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent whitespace-nowrap">WebID</h1>
                <p className="text-xs text-gray-400 whitespace-nowrap">Admin Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="w-full mb-4 p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 flex items-center justify-center group"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <PanelLeftClose 
            className={`w-5 h-5 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`} 
          />
          {isOpen && <span className="ml-2 text-sm font-medium">Collapse</span>}
        </button>
        
        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={!isOpen ? item.label : ''}
              className={({ isActive }) =>
                `group flex items-center ${isOpen ? 'justify-between px-4' : 'justify-center px-3'} py-3.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center ${isOpen ? 'space-x-3' : ''}`}>
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    } transition-colors`} />
                    {isOpen && (
                      <span className={`font-medium whitespace-nowrap ${
                        isActive ? 'text-white' : 'group-hover:text-white'
                      } transition-colors`}>{item.label}</span>
                    )}
                  </div>
                  {isActive && isOpen && (
                    <ChevronRight className="w-4 h-4 text-white flex-shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        {isOpen && (
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">Need Help?</p>
              <p className="text-sm font-medium text-white mb-3">Check our documentation</p>
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:shadow-lg transition-all duration-200">
                View Docs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
