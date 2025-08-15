import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Bed, 
  Calendar, 
  List, 
  Sun, 
  Moon, 
  Menu, 
  X 
} from 'lucide-react';

const Layout = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/rooms', icon: Bed, label: 'Rooms' },
    { path: '/booking', icon: Calendar, label: 'Booking' },
    { path: '/all-bookings', icon: List, label: 'All Bookings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 z-50 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <img 
              src="/Gemini_Generated_Image_rh722brh722brh72.png" 
              alt="SBA Rooms Logo" 
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">SBA Rooms</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Management System</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </h2>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Close Button */}
      {isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="fixed top-4 right-4 z-60 lg:hidden p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        >
          <X size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      )}
    </div>
  );
};

export default Layout;