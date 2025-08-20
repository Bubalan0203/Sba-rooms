import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
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
      <Button
        variant="primary"
        className="d-lg-none position-fixed top-0 start-0 m-3 rounded-circle shadow"
        onClick={handleShow}
        style={{ width: "50px", height: "50px", zIndex: 1300 }}
      >
        <FaBars size={20} />
      </Button>

      {/* Sidebar / Drawer */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        responsive="lg"
        backdrop={true}
        className="shadow"
        style={{ width: "260px" }}
      >
        <Offcanvas.Header className="bg-primary text-white">
          <div className="d-flex flex-column align-items-center w-100">
            <Image
              roundedCircle
              style={{ width: "64px", height: "64px", border: "2px solid #fff" }}
              src="https://via.placeholder.com/64"
              alt="Logo"
              className="mb-2"
            />
            <h5 className="fw-bold mb-0">SBA Rooms</h5>
            <Badge bg="light" text="dark" className="mt-1">
              Management System
            </Badge>
          </div>
          <Button
            variant="link"
            className="text-white d-lg-none"
            onClick={handleClose}
          >
            <FaTimes size={20} />
          </Button>
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
                    `list-group-item list-group-item-action d-flex align-items-center gap-3 ${
                      isActive ? "active fw-bold" : ""
                    }`
                  }
                  style={({ isActive }) => ({
                    borderLeft: isActive ? `4px solid ${item.color}` : "4px solid transparent",
                    backgroundColor: isActive ? `${item.color}20` : "transparent",
                  })}
                  onClick={handleClose}
                >
                  <span style={{ color: item.color, fontSize: "1.2rem" }}>
                    {item.icon}
                  </span>
                  {item.text}
                </NavLink>
              </motion.div>
            ))}
          </ListGroup>

          {/* Footer */}
          <div className="text-center py-3 border-top small text-muted">
            <div>© 2025 SBA Rooms</div>
            <div className="opacity-75">Version 1.0.0</div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default SideNavbar;
