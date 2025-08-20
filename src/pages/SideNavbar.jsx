import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import styled from "styled-components";
import {
  Navbar,
  Offcanvas,
  ListGroup,
  Button,
  Image,
  Badge,
} from "react-bootstrap";
import {
  FaTachometerAlt,
  FaBed,
  FaBook,
  FaClipboardCheck,
  FaHistory,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  
  &.show {
    transform: translateX(0);
  }
  
  @media (min-width: 992px) {
    position: relative;
    transform: translateX(0);
    box-shadow: none;
    border-right: 1px solid #e5e7eb;
  }
`;

const SidebarHeader = styled.div`
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
  
  @media (min-width: 992px) {
    display: none;
  }
`;

const SidebarBody = styled.div`
  padding: 0;
  background: #f8fafc;
  height: calc(100vh - 200px);
  overflow-y: auto;
  
  @media (min-width: 992px) {
    height: calc(100vh - 180px);
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: #374151;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  font-weight: 500;
  
  &:hover {
    background: rgba(37, 99, 235, 0.1);
    color: #2563eb;
    transform: translateX(4px);
  }
  
  &.active {
    background: rgba(37, 99, 235, 0.15);
    color: #2563eb;
    font-weight: 600;
    border-left-color: #2563eb;
  }
  
  .icon {
    font-size: 1.3rem;
    min-width: 20px;
  }
`;

const SidebarFooter = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: white;
  font-size: 0.875rem;
  color: #6b7280;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (min-width: 992px) {
    display: none;
  }
`;

const FloatingMenuButton = styled(Button)`
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1300;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
  
  @media (min-width: 992px) {
    display: none;
  }
`;

const SideNavbar = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const menuItems = [
    { text: "Dashboard", icon: <FaTachometerAlt />, path: "/", color: "#2563eb" },
    { text: "Manage Rooms", icon: <FaBed />, path: "/rooms", color: "#10b981" },
    { text: "New Booking", icon: <FaBook />, path: "/booking", color: "#f59e0b" },
    { text: "Active Bookings", icon: <FaClipboardCheck />, path: "/active-bookings", color: "#059669" },
    { text: "All Bookings", icon: <FaHistory />, path: "/all-bookings", color: "#7c3aed" },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <FloatingMenuButton
        onClick={handleShow}
      >
        <FaBars size={20} />
      </FloatingMenuButton>

      {/* Overlay for mobile */}
      <Overlay show={show} onClick={handleClose} />

      {/* Sidebar / Drawer */}
      <SidebarContainer className={show ? 'show' : ''}>
        <SidebarHeader>
          <CloseButton onClick={handleClose}>
            <FaTimes />
          </CloseButton>
          <div className="d-flex flex-column align-items-center w-100">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center mb-3"
              style={{ 
                width: "80px", 
                height: "80px", 
                background: "rgba(255, 255, 255, 0.2)",
                border: "2px solid rgba(255, 255, 255, 0.3)"
              }}
            >
              <FaBed size={32} className="text-white" />
            </div>
            <h4 className="fw-bold mb-1 text-white">SBA Rooms</h4>
            <Badge bg="light" text="dark" className="px-3 py-1">
              Management System
            </Badge>
          </div>
        </SidebarHeader>

        <SidebarBody>
          {/* Navigation */}
          <div className="flex-grow-1">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <NavItem
                  to={item.path}
                  onClick={handleClose}
                >
                  <span className="icon" style={{ color: item.color }}>
                    {item.icon}
                  </span>
                  <span className="fw-medium">{item.text}</span>
                </NavItem>
              </motion.div>
            ))}
          </div>
        </SidebarBody>

        {/* Footer */}
        <SidebarFooter>
          <div>
            <div className="fw-medium">© 2025 SBA Rooms</div>
            <div className="opacity-75 mt-1">Version 1.0.0</div>
          </div>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
};

export default SideNavbar;
