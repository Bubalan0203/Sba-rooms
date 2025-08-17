import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import your pages
import RoomsPage from "./pages/RoomsPage";
import BookingPage from "./pages/BookingPage";
import AllBookingsPage from "./pages/AllBookingsPage";
import ActiveBookingsPage from "./pages/ActiveBookingsPage";
import DashboardPage from "./pages/DashboardPage";

// Import the new Navbar component
import SideNavbar from "./pages/SideNavbar";

function App() {
  return (
    <Router>
      <div style={styles.appContainer}>
        {/* The SideNavbar is outside the Routes, so it's always visible */}
        <SideNavbar />

        {/* The main content area where pages will be rendered */}
        <main style={styles.mainContent}>
          <Routes>
            {/* Add a default route to redirect to the dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/active-bookings" element={<ActiveBookingsPage />} />
            <Route path="/all-bookings" element={<AllBookingsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// --- Styles for the layout ---
const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
  },
  mainContent: {
    flex: 1, // Takes up the remaining space
    padding: '20px',
    backgroundColor: '#f4f7f6',
  },
};

export default App;