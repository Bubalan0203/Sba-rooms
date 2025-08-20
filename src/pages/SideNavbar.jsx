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
          p: { xs: 2, sm: 2.5, md: 3 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: 120, sm: 140, md: 160 },
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
              top: 8,
              right: 8,
              color: 'white',
              zIndex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              width: 32,
              height: 32,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        )}

        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: -10, sm: -15, md: -20 },
            right: { xs: -10, sm: -15, md: -20 },
            width: { xs: 50, sm: 60, md: 80 },
            height: { xs: 50, sm: 60, md: 80 },
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: -20, sm: -25, md: -30 },
            left: { xs: -20, sm: -25, md: -30 },
            width: { xs: 60, sm: 80, md: 100 },
            height: { xs: 60, sm: 80, md: 100 },
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Avatar
            sx={{
              width: { xs: 48, sm: 56, md: 64 },
              height: { xs: 48, sm: 56, md: 64 },
              mb: { xs: 1, sm: 1.5, md: 2 },
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
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
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
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
              fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
              fontWeight: 500,
              backdropFilter: 'blur(10px)',
              height: { xs: 20, sm: 24, md: 28 }
            }}
          />
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, p: { xs: 0.5, sm: 1, md: 2 } }}>
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
                  borderRadius: { xs: 8, sm: 12, md: 16 },
                  mb: { xs: 0.25, sm: 0.5, md: 1 },
                  mx: { xs: 0.5, sm: 0.75, md: 1 },
                  py: { xs: 0.75, sm: 1, md: 1.5 },
                  px: { xs: 1, sm: 1.5, md: 2 },
                  color: theme.palette.text.primary,
                  textDecoration: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: { xs: 36, sm: 44, md: 48 },
                  '&:hover': {
                    backgroundColor: `${item.color}15`,
                    transform: { xs: 'translateX(2px)', sm: 'translateX(4px)', md: 'translateX(8px)' },
                    boxShadow: `0 4px 12px ${item.color}20`,
                    '&::before': {
                      width: { xs: '2px', sm: '3px', md: '4px' },
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
                    borderRadius: { xs: '0 4px 4px 0', sm: '0 6px 6px 0', md: '0 8px 8px 0' },
                  },
                  '&.active': {
                    backgroundColor: `${item.color}20`,
                    color: item.color,
                    fontWeight: 600,
                    boxShadow: `0 4px 12px ${item.color}25`,
                    '&::before': {
                      width: { xs: '2px', sm: '3px', md: '4px' },
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
                    minWidth: { xs: 32, sm: 40, md: 48 },
                    transition: 'color 0.3s ease',
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                />
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Box>

      <Divider sx={{ mx: { xs: 0.5, sm: 1, md: 2 } }} />
      
      {/* Footer */}
      <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, textAlign: 'center' }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
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
            fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' }, 
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
            top: 12,
            left: 12,
            zIndex: 1300,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
            backdropFilter: 'blur(10px)',
            width: 44,
            height: 44,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              transform: 'scale(1.05)',
              boxShadow: '0 12px 40px rgba(37, 99, 235, 0.4)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <MenuIcon sx={{ fontSize: '1.3rem' }} />
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