import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import IntroAnimation from "./components/IntroAnimation";

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <IntroAnimation>
        <Router>
          <div style={styles.appContainer}>
            {/* The SideNavbar is outside the Routes, so it's always visible */}
            <SideNavbar />

            {/* The main content area where pages will be rendered */}
            <main style={styles.mainContent}>
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

// --- Styles for the layout ---
const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
  },
  mainContent: {
    flex: 1, // Takes up the remaining space
    padding: 0,
    backgroundColor: '#f1f5f9',
    overflow: 'auto',
    marginLeft: { xs: 0, md: '280px' },
    transition: 'margin-left 0.3s ease',
  },
};

export default App;