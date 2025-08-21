import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaBed } from 'react-icons/fa';

const slideAnimation = keyframes`
  100% {
    background-position: right;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const LoadingContainer = styled.div`
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
  z-index: 9999;
  color: white;
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
  animation: ${scaleIn} 0.8s ease-out;
`;

const LogoIcon = styled.div`
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  animation: ${fadeInUp} 1s ease-out 0.2s both;
`;

const BrandText = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
  animation: ${fadeInUp} 1s ease-out 0.4s both;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SubText = styled.p`
  font-size: 1.2rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  animation: ${fadeInUp} 1s ease-out 0.6s both;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Loader = styled.div`
  width: calc(80px / cos(45deg));
  height: 14px;
  background: repeating-linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.8) 0 15px,
    transparent 0 20px
  ) left/200% 100%;
  animation: ${slideAnimation} 2s infinite linear, ${fadeInUp} 1s ease-out 0.8s both;
  border-radius: 7px;
`;

const LoadingText = styled.p`
  margin-top: 2rem;
  font-size: 1rem;
  opacity: 0.8;
  animation: ${fadeInUp} 1s ease-out 1s both;
`;

const LoadingAnimation = ({ text = "Loading..." }) => {
  return (
    <LoadingContainer>
      <LogoContainer>
        <LogoIcon>
          <FaBed size={40} color="white" />
        </LogoIcon>
        <BrandText>SBA Rooms</BrandText>
        <SubText>Management System</SubText>
      </LogoContainer>
      
      <Loader />
      <LoadingText>{text}</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingAnimation;