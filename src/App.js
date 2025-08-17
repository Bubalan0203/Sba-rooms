import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import IntroAnimation from "./components/IntroAnimation";
import "./index.css";

// Import your pages
import HomePage from "./pages/HomePage";
import RoomsPage from "./pages/RoomsPage";
import BookingPage from "./pages/BookingPage";
import AllBookingsPage from "./pages/AllBookingsPage";
import ActiveBookingsPage from "./pages/ActiveBookingsPage";
import DashboardPage from "./pages/DashboardPage";

// Import the new Navbar component
import SideNavbar from "./pages/SideNavbar";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="sba-ui-theme">
      <IntroAnimation>
        <Router>
          <div className="flex min-h-screen bg-background">
            {/* The SideNavbar is outside the Routes, so it's always visible */}
            <SideNavbar />

            {/* The main content area where pages will be rendered */}
            <main className="flex-1 overflow-auto">
              <Routes>
                {/* Add a default route to redirect to the home page */}
    
                
                <Route path="/" element={<DashboardPage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/active-bookings" element={<ActiveBookingsPage />} />
                <Route path="/all-bookings" element={<AllBookingsPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </IntroAnimation>
    </ThemeProvider>
  );
}

export default App;