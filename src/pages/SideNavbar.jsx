import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Hotel, 
  CalendarPlus, 
  Clock, 
  History, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ThemeToggle } from '../components/ThemeToggle';

const SideNavbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { text: 'Manage Rooms', icon: Hotel, path: '/rooms' },
    { text: 'New Booking', icon: CalendarPlus, path: '/booking' },
    { text: 'Active Bookings', icon: Clock, path: '/active-bookings' },
    { text: 'All Bookings', icon: History, path: '/all-bookings' },
  ];

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  };

  const LogoSection = ({ collapsed }) => (
    <motion.div
      className="p-6 border-b border-border bg-gradient-to-br from-primary/10 to-secondary/10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-center">
        <motion.div
          className="relative"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">SBA</span>
          </div>
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3"
            >
              <h2 className="text-lg font-bold text-foreground">SBA Rooms</h2>
              <p className="text-xs text-muted-foreground">Management System</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const MenuItem = ({ item, index, collapsed }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <NavLink
        to={item.path}
        onClick={() => setIsMobileOpen(false)}
        className={({ isActive }) =>
          cn(
            "flex items-center px-4 py-3 mx-3 rounded-lg transition-all duration-200 group relative",
            "hover:bg-accent hover:text-accent-foreground",
            isActive 
              ? "bg-primary text-primary-foreground shadow-md" 
              : "text-muted-foreground hover:text-foreground"
          )
        }
      >
        {({ isActive }) => (
          <>
            <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "mx-auto" : "mr-3")} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.text}
                </motion.span>
              )}
            </AnimatePresence>
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute right-2 w-2 h-2 bg-primary-foreground rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </>
        )}
      </NavLink>
    </motion.div>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex flex-col bg-card border-r border-border shadow-sm"
    >
      <LogoSection collapsed={isCollapsed} />
      
      <nav className="flex-1 py-4">
        {menuItems.map((item, index) => (
          <MenuItem key={item.path} item={item} index={index} collapsed={isCollapsed} />
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && <ThemeToggle />}
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </motion.button>
          {isCollapsed && <ThemeToggle />}
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-center"
          >
            <p className="text-xs text-muted-foreground">© 2025 SBA Rooms</p>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-primary text-primary-foreground shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="h-6 w-6" />
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border shadow-xl z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <LogoSection collapsed={false} />
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <nav className="flex-1 py-4">
                {menuItems.map((item, index) => (
                  <MenuItem key={item.path} item={item} index={index} collapsed={false} />
                ))}
              </nav>

              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <ThemeToggle />
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs text-muted-foreground">© 2025 SBA Rooms</p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default SideNavbar;