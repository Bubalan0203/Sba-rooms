import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot, updateDoc, doc, runTransaction, serverTimestamp, Timestamp } from "firebase/firestore";
import { motion } from 'framer-motion';

const BOOKING_START_HOUR = 12;

const ActiveBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extendDialog, setExtendDialog] = useState({ open: false, booking: null });
  const [extendAmount, setExtendAmount] = useState('');

  useEffect(() => {
    const bookingsCollection = collection(db, "bookings");
    const unsubBookings = onSnapshot(bookingsCollection, (snapshot) => {
      const bookingsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      bookingsData.sort((a, b) => a.roomNo - b.roomNo);
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings: ", error);
      setLoading(false);
    });
    return () => unsubBookings();
  }, []);

  const getBookingCycleEnd = (checkInTimestamp) => {
    if (!checkInTimestamp) return null;
    const checkInDate = checkInTimestamp.toDate();
    const cycleEnd = new Date(checkInDate);
    cycleEnd.setHours(BOOKING_START_HOUR, 0, 0, 0);

    if (checkInDate.getHours() >= BOOKING_START_HOUR) {
      cycleEnd.setDate(cycleEnd.getDate() + 1);
    }
    return cycleEnd;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCheckout = async (bookingId, roomId) => {
    if (!window.confirm("Are you sure you want to check out this guest?")) return;
    const bookingRef = doc(db, "bookings", bookingId);
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(bookingRef, { checkOut: serverTimestamp(), status: 'Completed' });
    await updateDoc(roomRef, { status: 'Available' });
  };

  const handleAlreadyCheckout = async (bookingId, roomId, cycleEndDate) => {
    if (!window.confirm("Mark this guest as checked out at the cycle end time?")) return;
    const bookingRef = doc(db, "bookings", bookingId);
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(bookingRef, { checkOut: Timestamp.fromDate(cycleEndDate), status: 'Completed' });
    await updateDoc(roomRef, { status: 'Available' });
  };

  const handleOpenExtendDialog = (booking) => {
    setExtendDialog({ open: true, booking });
    setExtendAmount(booking.amount.toString());
  };

  const handleCloseExtendDialog = () => {
    setExtendDialog({ open: false, booking: null });
    setExtendAmount('');
  };

  const handleExtendStay = async () => {
    const { booking } = extendDialog;
    const newAmount = parseFloat(extendAmount);
    
    if (isNaN(newAmount) || newAmount <= 0) {
      alert("Invalid amount. Extension cancelled.");
      return;
    }

    const cycleEndDate = getBookingCycleEnd(booking.checkIn);
    const { id, ...oldBookingData } = booking;
    const oldBookingRef = doc(db, "bookings", booking.id);
    const bookingsCollection = collection(db, "bookings");

    try {
      await runTransaction(db, async (transaction) => {
        transaction.update(oldBookingRef, { checkOut: Timestamp.fromDate(cycleEndDate), status: 'Extended' });
        
        const newCheckIn = new Date(cycleEndDate);
        transaction.set(doc(bookingsCollection), {
          ...oldBookingData,
          amount: newAmount,
          checkIn: Timestamp.fromDate(newCheckIn),
          checkOut: null,
          status: 'Active',
          createdAt: serverTimestamp()
        });
      });
      alert(`Stay for Room ${booking.roomNo} has been successfully extended.`);
      handleCloseExtendDialog();
    } catch (error) {
      console.error("Extension transaction failed: ", error);
      alert("Failed to extend stay. Please try again.");
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'Active');

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Active Bookings</h2>

      {activeBookings.length > 0 ? (
        <div className="row g-3">
          {activeBookings.map((booking, index) => {
            const cycleEndDate = getBookingCycleEnd(booking.checkIn);
            const isOverdue = cycleEndDate && new Date() > cycleEndDate;

            return (
              <div className="col-md-4" key={booking.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className={`card ${isOverdue ? 'border-danger' : 'border-success'}`}>
                    <div className="card-body">
                      <h5 className="card-title">Room {booking.roomNo}</h5>
                      <p><strong>Guest:</strong> {booking.guestName}</p>
                      <p><strong>Phone:</strong> {booking.customerPhone}</p>
                      <p><strong>Amount:</strong> ₹{parseFloat(booking.amount).toLocaleString()}</p>
                      <p><strong>Check-in:</strong> {formatDate(booking.checkIn?.toDate())}</p>
                      {cycleEndDate && <p><strong>Cycle ends:</strong> {formatDate(cycleEndDate)}</p>}
                      <p><strong>Guests:</strong> {booking.numberOfPersons || 1}</p>
                    </div>
                    <div className="card-footer d-flex justify-content-end gap-2">
                      {isOverdue ? (
                        <>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleAlreadyCheckout(booking.id, booking.roomId, cycleEndDate)}>Already Left</button>
                          <button className="btn btn-primary btn-sm" onClick={() => handleOpenExtendDialog(booking)}>Extend</button>
                        </>
                      ) : (
                        <button className="btn btn-success btn-sm" onClick={() => handleCheckout(booking.id, booking.roomId)}>Checkout</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="alert alert-info text-center">No Active Bookings</div>
      )}

      {/* Extend Stay Modal */}
      {extendDialog.open && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Extend Stay - Room {extendDialog.booking?.roomNo}</h5>
                <button type="button" className="btn-close" onClick={handleCloseExtendDialog}></button>
              </div>
              <div className="modal-body">
                <p>Enter the amount for {extendDialog.booking?.guestName}'s extended stay.</p>
                <input
                  type="number"
                  className="form-control"
                  value={extendAmount}
                  onChange={(e) => setExtendAmount(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseExtendDialog}>Cancel</button>
                <button className="btn btn-primary" onClick={handleExtendStay}>Extend Stay</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveBookingsPage;
