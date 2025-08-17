import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import jsPDF from "jspdf";
import { db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";

// --- Modal Component Definition ---
// NOTE: We define the modal component in the same file, so no separate import is needed.

// Basic styling for the modal
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxHeight: "90vh",
    width: "500px",
    maxWidth: "90%",
    borderRadius: "8px",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
};

// Bind modal to your app element (for accessibility)
Modal.setAppElement("#root");

const BookingDetailsModal = ({ isOpen, onRequestClose, booking }) => {
  if (!booking) {
    return null; // Don't render if there's no booking selected
  }

  // Helper to format Firestore Timestamps
  const formatTimestamp = (timestamp) => {
    return timestamp?.toDate ? timestamp.toDate().toLocaleString() : "N/A";
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Booking Details"
    >
      <h2>Booking Details</h2>
      <div style={{ lineHeight: "1.8" }}>
        <p><strong>Room No:</strong> {booking.roomNo}</p>
        <p><strong>Guest Name:</strong> {booking.guestName}</p>
        <p><strong>Customer Phone:</strong> {booking.customerPhone}</p>
        <p><strong>Number of Persons:</strong> {booking.numberOfPersons}</p>
        <p><strong>Status:</strong> {booking.status}</p>
        <hr />
        <p><strong>Check-In Time:</strong> {formatTimestamp(booking.checkIn)}</p>
        <p><strong>Check-Out Time:</strong> {booking.checkOut ? formatTimestamp(booking.checkOut) : "Not Checked Out"}</p>
        <p><strong>Total Amount:</strong> ₹{booking.amount}</p>
        <hr />
        {booking.idProof && (
          <div>
            <strong>ID Proof:</strong>
            <img
              src={booking.idProof} // The idProof from Firestore already has the data URI prefix
              alt="ID Proof"
              style={{ width: "100%", marginTop: "10px", border: "1px solid #ccc", borderRadius: '4px' }}
            />
          </div>
        )}
      </div>
      <button onClick={onRequestClose} style={{ marginTop: "20px", padding: "10px 15px", cursor: 'pointer' }}>
        Close
      </button>
    </Modal>
  );
};


// --- Main Page Component ---

const AllBookingsPage = () => {
  const bookingsCollection = collection(db, "bookings");
  const [bookings, setBookings] = useState([]);
  
  // State for managing the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(bookingsCollection, (snapshot) => {
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(bookingsData);
    });
    return () => unsubscribe();
  }, []);

  // Function to open the modal with the selected booking's data
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  // Updated function to generate the bill
  const handleGenerateBill = (booking) => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("SBA Rooms", 105, 20, null, null, "center");
    doc.setFontSize(16);
    doc.text("Invoice / Bill", 105, 30, null, null, "center");

    doc.setFontSize(12);
    const checkInTime = booking.checkIn?.toDate ? booking.checkIn.toDate().toLocaleString() : "N/A";
    const checkOutTime = booking.checkOut?.toDate ? booking.checkOut.toDate().toLocaleString() : "Not Checked Out";

    doc.text(`Booking ID: ${booking.id}`, 20, 50);
    doc.text(`Room No: ${booking.roomNo}`, 20, 60);
    doc.text(`Guest Name: ${booking.guestName}`, 20, 70);
    doc.text(`Number of Persons: ${booking.numberOfPersons}`, 20, 80);
    doc.text(`Check-In: ${checkInTime}`, 20, 90);
    doc.text(`Check-Out: ${checkOutTime}`, 20, 100);

    doc.line(20, 110, 190, 110); // Horizontal line

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount Paid: ₹${booking.amount}`, 20, 120);
    doc.setFont("helvetica", "normal");

    doc.setFontSize(10);
    doc.text("Thank you for your stay at SBA Rooms!", 105, 140, null, null, "center");

    doc.save(`SBA-Rooms-Bill-${booking.roomNo}-${booking.id.slice(0, 5)}.pdf`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={tableHeaderStyle}>Room No</th>
              <th style={tableHeaderStyle}>Guest Name</th>
              <th style={tableHeaderStyle}>Check-In</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={tableCellStyle}>{booking.roomNo}</td>
                <td style={tableCellStyle}>{booking.guestName}</td>
                <td style={tableCellStyle}>
                  {booking.checkIn?.toDate ? booking.checkIn.toDate().toLocaleDateString() : 'N/A'}
                </td>
                <td style={tableCellStyle}>{booking.status}</td>
                <td style={tableCellStyle}>
                  <button onClick={() => handleViewDetails(booking)} style={{ marginRight: '5px', cursor: 'pointer' }}>
                    View Details
                  </button>
                  <button onClick={() => handleGenerateBill(booking)} style={{ cursor: 'pointer' }}>
                    Download Bill
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/* The Modal Component is called here */}
      <BookingDetailsModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        booking={selectedBooking}
      />
    </div>
  );
};

// Basic styles for the table
const tableHeaderStyle = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #333' };
const tableCellStyle = { padding: '12px', textAlign: 'left' };

export default AllBookingsPage;