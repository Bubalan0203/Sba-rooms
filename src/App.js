import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import RoomsPage from "./pages/RoomsPage";
import BookingPage from "./pages/BookingPage";
import AllBookingsPage from "./pages/AllBookingsPage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/all-bookings" element={<AllBookingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;