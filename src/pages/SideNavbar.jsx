import React from 'react';
import { NavLink } from 'react-router-dom';

const SideNavbar = () => {
  // Style for the active link
  const activeLinkStyle = {
    backgroundColor: '#0056b3',
    color: '#ffffff',
  };

  return (
    <nav style={styles.nav}>
      <h1 style={styles.title}>SBA Rooms</h1>
      <div style={styles.menuGroup}>
        <h2 style={styles.groupTitle}>Dashboard Management</h2>
        <NavLink
          to="/dashboard"
          style={styles.link}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Dashboard
        </NavLink>
      </div>

      <div style={styles.menuGroup}>
        <h2 style={styles.groupTitle}>Rooms Management</h2>
        <NavLink
          to="/rooms"
          style={styles.link}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Manage Rooms
        </NavLink>
      </div>

      <div style={styles.menuGroup}>
        <h2 style={styles.groupTitle}>Booking Management</h2>
        <NavLink
          to="/booking"
          style={styles.link}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          New Booking
        </NavLink>
        <NavLink
          to="/active-bookings"
          style={styles.link}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Active Bookings
        </NavLink>
        <NavLink
          to="/all-bookings"
          style={styles.link}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          All Bookings
        </NavLink>
      </div>
    </nav>
  );
};

// --- Styles ---
const styles = {
  nav: {
    width: '250px',
    minHeight: '100vh',
    backgroundColor: '#007bff',
    color: '#ffffff',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '1.8rem',
    textAlign: 'center',
    marginBottom: '30px',
    color: '#ffffff',
  },
  menuGroup: {
    marginBottom: '25px',
  },
  groupTitle: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    color: '#cce5ff',
    marginBottom: '10px',
    letterSpacing: '1px',
  },
  link: {
    display: 'block',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '12px 15px',
    borderRadius: '5px',
    marginBottom: '5px',
    fontSize: '1rem',
    transition: 'background-color 0.2s',
  },
};

// Add a style tag to the document head for the active class
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  a.active {
    background-color: #0056b3;
    font-weight: bold;
  }
  a:hover {
    background-color: #0069d9;
  }
`;
document.head.appendChild(styleSheet);


export default SideNavbar;