import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Box, 
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Hotel as HotelIcon,
  BookOnline as BookingIcon,
  EventAvailable as ActiveIcon,
  History as HistoryIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

const SideNavbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Manage Rooms', icon: <HotelIcon />, path: '/rooms' },
    { text: 'New Booking', icon: <BookingIcon />, path: '/booking' },
    { text: 'Active Bookings', icon: <ActiveIcon />, path: '/active-bookings' },
    { text: 'All Bookings', icon: <HistoryIcon />, path: '/all-bookings' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              SBA
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            SBA Rooms
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Management System
          </Typography>
        </Box>
      </motion.div>

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <ListItem
              component={NavLink}
              to={item.path}
              onClick={isMobile ? handleDrawerToggle : undefined}
              sx={{
                borderRadius: 2,
                mb: 1,
                color: theme.palette.text.primary,
                textDecoration: 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: theme.palette.primary.light + '20',
                  transform: 'translateX(4px)',
                },
                '&.active': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.text.secondary,
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            </ListItem>
          </motion.div>
        ))}
      </List>

      <Divider />
      
      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 SBA Rooms
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default SideNavbar;