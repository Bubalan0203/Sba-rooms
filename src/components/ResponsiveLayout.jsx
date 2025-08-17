import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

const ResponsiveLayout = ({ children, maxWidth = "xl", sx = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Container
        maxWidth={maxWidth}
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3, md: 4 },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          ...sx,
        }}
      >
        {children}
      </Container>
    </motion.div>
  );
};

export default ResponsiveLayout;