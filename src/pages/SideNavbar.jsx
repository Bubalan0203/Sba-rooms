import React, { useState } from 'react';
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
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Hotel as HotelIcon,
  BookOnline as BookingIcon,
  EventAvailable as ActiveIcon,
  History as HistoryIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const SideNavbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', color: '#2563eb' },
    { text: 'Manage Rooms', icon: <HotelIcon />, path: '/rooms', color: '#10b981' },
    { text: 'New Booking', icon: <BookingIcon />, path: '/booking', color: '#f59e0b' },
    { text: 'Active Bookings', icon: <ActiveIcon />, path: '/active-bookings', color: '#059669' },
    { text: 'All Bookings', icon: <HistoryIcon />, path: '/all-bookings', color: '#7c3aed' },
  ];

  const drawerWidth = isMobile ? 280 : isTablet ? 240 : 280;

  const drawerContent = (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: 140, sm: 160 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              position: 'absolute',
              top: { xs: 8, sm: 12 },
              right: { xs: 8, sm: 12 },
              color: 'white',
              zIndex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}

        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: -15, sm: -20 },
            right: { xs: -15, sm: -20 },
            width: { xs: 60, sm: 80 },
            height: { xs: 60, sm: 80 },
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: -25, sm: -30 },
            left: { xs: -25, sm: -30 },
            width: { xs: 80, sm: 100 },
            height: { xs: 80, sm: 100 },
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Avatar
            sx={{
              width: { xs: 56, sm: 64 },
              height: { xs: 56, sm: 64 },
              mb: { xs: 1.5, sm: 2 },
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              fontSize: { xs: '1.3rem', sm: '1.5rem' },
              fontWeight: 800,
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            SBA
          </Avatar>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              mb: 0.5,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              textAlign: 'center',
            }}
          >
            SBA Rooms
          </Typography>
          <Chip
            label="Management System"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              fontWeight: 500,
              backdropFilter: 'blur(10px)',
            }}
          />
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2 } }}>
        <List sx={{ p: 0 }}>
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
                  borderRadius: { xs: 12, sm: 16 },
                  mb: { xs: 0.5, sm: 1 },
                  mx: { xs: 0.5, sm: 1 },
                  py: { xs: 1, sm: 1.5 },
                  px: { xs: 1.5, sm: 2 },
                  color: theme.palette.text.primary,
                  textDecoration: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: { xs: 44, sm: 48 },
                  '&:hover': {
                    backgroundColor: `${item.color}15`,
                    transform: { xs: 'translateX(4px)', sm: 'translateX(8px)' },
                    boxShadow: `0 4px 12px ${item.color}20`,
                    '&::before': {
                      width: { xs: '3px', sm: '4px' },
                    },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 0,
                    backgroundColor: item.color,
                    transition: 'width 0.3s ease',
                    borderRadius: '0 8px 8px 0',
                  },
                  '&.active': {
                    backgroundColor: `${item.color}20`,
                    color: item.color,
                    fontWeight: 600,
                    boxShadow: `0 4px 12px ${item.color}25`,
                    '&::before': {
                      width: { xs: '3px', sm: '4px' },
                    },
                    '& .MuiListItemIcon-root': {
                      color: item.color,
                    },
                    '&:hover': {
                      backgroundColor: `${item.color}25`,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: theme.palette.text.secondary,
                    minWidth: { xs: 40, sm: 48 },
                    transition: 'color 0.3s ease',
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.3rem', sm: '1.5rem' },
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: { xs: '0.9rem', sm: '0.95rem' },
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                />
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Box>

      <Divider sx={{ mx: { xs: 1, sm: 2 } }} />
      
      {/* Footer */}
      <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            fontWeight: 500,
          }}
        >
          © 2025 SBA Rooms
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            display: 'block', 
            fontSize: { xs: '0.65rem', sm: '0.7rem' }, 
            mt: 0.5,
            opacity: 0.7,
          }}
        >
          Version 1.0.0
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
            top: { xs: 12, sm: 16 },
            left: { xs: 12, sm: 16 },
            zIndex: 1300,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
            backdropFilter: 'blur(10px)',
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              transform: 'scale(1.05)',
              boxShadow: '0 12px 40px rgba(37, 99, 235, 0.4)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: `1px solid rgba(0, 0, 0, 0.08)`,
              backgroundColor: theme.palette.background.paper,
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.06)',
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
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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