import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import styled from "styled-components";

import RoomsPage from "./pages/RoomsPage";
import BookingPage from "./pages/BookingPage";
import AllBookingsPage from "./pages/AllBookingsPage";
import ActiveBookingsPage from "./pages/ActiveBookingsPage";
import DashboardPage from "./pages/DashboardPage";
import SideNavbar from "./pages/SideNavbar";
import OpeningAnimation from "./components/OpeningAnimation";
import LoadingAnimation from "./components/LoadingAnimation";

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
`;

const SidebarWrapper = styled.div`
  width: 280px;
  flex-shrink: 0;
  
  @media (max-width: 991px) {
    width: 0;
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
  background: #f1f5f9;
  
  @media (max-width: 991px) {
    width: 100%;
  }
`;

function App() {
  const [showOpening, setShowOpening] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  const handleOpeningComplete = () => {
    setShowOpening(false);
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  // Simulate page loading
  useEffect(() => {
    const handleRouteChange = () => {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1200);
      return () => clearTimeout(timer);
    };

    // Listen for route changes
    const currentPath = window.location.pathname;
    setCurrentPage(currentPath);
    
    if (!showOpening) {
      return handleRouteChange();
    }
  }, []);

  if (showOpening) {
    return <OpeningAnimation onComplete={handleOpeningComplete} duration={4000} />;
  }

  if (isLoading) {
    return <LoadingAnimation text="Loading..." />;
  }

  return (
    <Router>
      <AppContainer>
        <SidebarWrapper>
          <SideNavbar />
        </SidebarWrapper>

        <MainContent>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/active-bookings" element={<ActiveBookingsPage />} />
            <Route path="/all-bookings" element={<AllBookingsPage />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App;
