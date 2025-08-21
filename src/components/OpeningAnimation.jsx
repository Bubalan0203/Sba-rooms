import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBed } from 'react-icons/fa';

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const OpeningContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  color: white;
  overflow: hidden;
`;

const BackgroundPattern = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
`;

const LogoContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
`;

const LogoIcon = styled(motion.div)`
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  border: 4px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: ${float} 3s ease-in-out infinite;
`;

const BrandText = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.03em;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 1) 50%,
    rgba(255, 255, 255, 0.8) 100%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 2s ease-in-out infinite;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const SubText = styled(motion.p)`
  font-size: 1.4rem;
  margin: 1rem 0 0 0;
  opacity: 0.95;
  font-weight: 600;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const TagLine = styled(motion.p)`
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.8;
  font-style: italic;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const OpeningAnimation = ({ onComplete, duration = 3000 }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleExitComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {show && (
        <OpeningContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.1,
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
        >
          <BackgroundPattern
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          
          <LogoContainer>
            <LogoIcon
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 1.2, 
                ease: "easeOut",
                type: "spring",
                stiffness: 100
              }}
            >
              <FaBed size={50} color="white" />
            </LogoIcon>
            
            <BrandText
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              SBA Rooms
            </BrandText>
            
            <SubText
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              Management System
            </SubText>
            
            <TagLine
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Streamline Your Hotel Operations
            </TagLine>
          </LogoContainer>
        </OpeningContainer>
      )}
    </AnimatePresence>
  );
};

export default OpeningAnimation;