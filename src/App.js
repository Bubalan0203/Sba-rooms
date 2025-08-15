import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoomsPage from "./pages/RoomsPage";
import BookingPage from "./pages/BookingPage";
import AllBookingsPage from "./pages/AllBookingsPage";

function App() {
  return (
    <Router>
      
      <Routes>
         <Route path="/" element={<Dashboardpage />} /> {// shows stats of bookings costs etc 
         }
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/all-bookings" element={<AllBookingsPage />} />
      </Routes>

    </Router>
  );
}

export default App;