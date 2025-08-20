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

const StyledOffcanvas = styled(Offcanvas)`
  .offcanvas-header {
    background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
    color: white;
    padding: 2rem;
    
    .btn-close {
      filter: invert(1);
      opacity: 0.8;
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
  .offcanvas-body {
    padding: 0;
    background: #f8fafc;
  }
  
  .list-group-item {
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 1rem 1.5rem;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(37, 99, 235, 0.1);
      transform: translateX(4px);
    }
    
    &.active {
      background: rgba(37, 99, 235, 0.15);
      color: #2563eb;
      font-weight: 600;
    }
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

      {/* Sidebar / Drawer */}
      <StyledOffcanvas
        show={show}
        onHide={handleClose}
        responsive="lg"
        backdrop={true}
        style={{ width: "260px" }}
      >
        <Offcanvas.Header className="bg-primary text-white">
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
          <button className="btn-close d-lg-none" onClick={handleClose}>
            <FaTimes size={20} />
          </button>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column p-0">
          {/* Navigation */}
          <ListGroup variant="flush" className="flex-grow-1">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `list-group-item list-group-item-action d-flex align-items-center gap-3 text-decoration-none ${
                      isActive ? "active fw-bold" : ""
                    }`
                  }
                  style={({ isActive }) => ({
                    borderLeft: isActive ? `4px solid ${item.color}` : "4px solid transparent"
                  })}
                  onClick={handleClose}
                >
                  <span style={{ color: item.color, fontSize: "1.3rem" }}>
                    {item.icon}
                  </span>
                  <span className="fw-medium">{item.text}</span>
                </NavLink>
              </motion.div>
            ))}
          </ListGroup>

          {/* Footer */}
          <div className="text-center py-3 border-top small text-muted">
            <div className="fw-medium">© 2025 SBA Rooms</div>
            <div className="opacity-75 mt-1">Version 1.0.0</div>
          </div>
        </Offcanvas.Body>
      </StyledOffcanvas>
    </>
  );
};

export default SideNavbar;
