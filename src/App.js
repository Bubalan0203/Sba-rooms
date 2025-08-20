import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import RoomsPage from "./pages/RoomsPage";
import BookingPage from "./pages/BookingPage";
import AllBookingsPage from "./pages/AllBookingsPage";
import ActiveBookingsPage from "./pages/ActiveBookingsPage";
import DashboardPage from "./pages/DashboardPage";
import SideNavbar from "./pages/SideNavbar";

function App() {
  return (
    <Router>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar on the left */}
        <div style={{ width: "260px", flexShrink: 0 }}>
          <SideNavbar />
        </div>

        {/* Main Content on the right */}
        <div style={{ flex: 1, padding: "1rem", background: "#f9fafb" }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/active-bookings" element={<ActiveBookingsPage />} />
            <Route path="/all-bookings" element={<AllBookingsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
