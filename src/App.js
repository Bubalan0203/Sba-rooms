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
          <SideNavbar />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/active-bookings" element={<ActiveBookingsPage />} />
            <Route path="/all-bookings" element={<AllBookingsPage />} />
          </Routes>
        </Router>
      
  );
}

export default App;
