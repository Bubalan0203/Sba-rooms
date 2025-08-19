import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const IntroAnimation = ({ onComplete, children }) => {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      if (onComplete) onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10000,
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                overflow: 'hidden',
              }}
            >
              {/* Animated Background Elements */}
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1.5, rotate: 360 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                style={{
                  position: 'absolute',
                  width: 'min(300px, 40vw)',
                  height: 'min(300px, 40vw)',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  top: '20%',
                  right: '10%',
                }}
              />
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1.2, rotate: -180 }}
                transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
                style={{
                  position: 'absolute',
                  width: 'min(200px, 30vw)',
                  height: 'min(200px, 30vw)',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  bottom: '20%',
                  left: '15%',
                }}
              />

              {/* Main Logo Animation */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.8, 
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 100 
                }}
              >
                <Box
                  sx={{
                    width: { xs: 120, sm: 140, md: 160, lg: 180 },
                    height: { xs: 120, sm: 140, md: 160, lg: 180 },
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: { xs: 2, sm: 3 },
                    backdropFilter: 'blur(20px)',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                  >
                    <Typography
                      variant="h1"
                      sx={{
                        color: 'white',
                        fontWeight: 900,
                        fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
                        textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      SBA
                    </Typography>
                  </motion.div>
                </Box>
              </motion.div>

              {/* Company Name Animation */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    mb: { xs: 0.5, sm: 1 },
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                    px: 2,
                  }}
                >
                  SBA Rooms
                </Typography>
              </motion.div>

              {/* Tagline Animation */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 400,
                    textAlign: 'center',
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                    letterSpacing: '0.02em',
                    px: 2,
                  }}
                >
                  Your Comfort, Our Priority
                </Typography>
              </motion.div>

              {/* Loading Dots Animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.5 }}
                style={{
                  position: 'absolute',
                  bottom: '12%',
                  display: 'flex',
                  gap: '6px',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.5, opacity: 0.5 }}
                    animate={{ scale: [0.5, 1, 0.5], opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    }}
                  />
                ))}
              </motion.div>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!showIntro && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
};

export default IntroAnimation;