import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot, updateDoc, doc, runTransaction, serverTimestamp, Timestamp } from "firebase/firestore";

// --- Top-Level Configurable Variable ---
const BOOKING_START_HOUR = 12; // 12 for 12 PM, 9 for 9 AM, etc.

// #####################################################################
// ## CSS Styles for the Component
// #####################################################################
const styles = `
    .bookings-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        padding: 20px;
        background-color: #f4f7f9;
    }
    .bookings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
    }
    .booking-card {
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-left: 5px solid #28a745; /* Green for active */
        display: flex;
        flex-direction: column;
        transition: transform 0.2s ease-in-out;
    }
    .booking-card:hover {
        transform: translateY(-5px);
    }
    .booking-card.overdue {
        border-left-color: #dc3545; /* Red for overdue */
        background-color: #fff8f8;
    }
    .card-header {
        padding: 16px 20px;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .card-header h4 {
        margin: 0;
        font-size: 1.5rem;
        color: #343a40;
    }
    .overdue-banner {
        background-color: #dc3545;
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
    }
    .card-body {
        padding: 20px;
        flex-grow: 1;
    }
    .detail-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        font-size: 1rem;
        color: #495057;
    }
    .detail-item strong {
        color: #212529;
        margin-left: 10px;
    }
    .card-footer {
        padding: 16px 20px;
        background-color: #f8f9fa;
        border-top: 1px solid #e9ecef;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    .btn {
        padding: 10px 18px;
        border: none;
        border-radius: 5px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .btn-checkout {
        background-color: #007bff;
        color: white;
    }
    .btn-checkout:hover {
        background-color: #0056b3;
    }
    .btn-extend {
        background-color: #28a745;
        color: white;
    }
    .btn-extend:hover {
        background-color: #218838;
    }
    .btn-secondary {
        background-color: #6c757d;
        color: white;
    }
    .btn-secondary:hover {
        background-color: #5a6268;
    }
    .no-bookings-message {
        text-align: center;
        padding: 50px;
        font-size: 1.2rem;
        color: #6c757d;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
`;

// #####################################################################
// ## Helper Function for Date Formatting
// #####################################################################
const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};


// #####################################################################
// ## Active Bookings & Checkout/Extension Component
// #####################################################################
const ActiveBookingsList = ({ bookings }) => {
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

    const handleExtendStay = async (booking, cycleEndDate) => {
        const newAmount = prompt(`Extend stay for Room ${booking.roomNo}.\nEnter amount for the new booking period:`, booking.amount);
        if (newAmount === null || isNaN(parseFloat(newAmount)) || parseFloat(newAmount) <= 0) {
            alert("Invalid amount. Extension cancelled.");
            return;
        }

        const { id, ...oldBookingData } = booking;
        const oldBookingRef = doc(db, "bookings", booking.id);
        const bookingsCollection = collection(db, "bookings");

        try {
            await runTransaction(db, async (transaction) => {
                // 1. End the old booking at the cycle end time
                transaction.update(oldBookingRef, { checkOut: Timestamp.fromDate(cycleEndDate), status: 'Extended' });
                
                // 2. Create the new booking starting right after
                const newCheckIn = new Date(cycleEndDate);
                transaction.set(doc(bookingsCollection), {
                    ...oldBookingData,
                    amount: parseFloat(newAmount),
                    checkIn: Timestamp.fromDate(newCheckIn),
                    checkOut: null,
                    status: 'Active',
                    createdAt: serverTimestamp()
                });
            });
            alert(`Stay for Room ${booking.roomNo} has been successfully extended.`);
        } catch (error) {
            console.error("Extension transaction failed: ", error);
            alert("Failed to extend stay. Please try again.");
        }
    };

    const activeBookings = bookings.filter(b => b.status === 'Active');

    if (activeBookings.length === 0) {
        return <p className="no-bookings-message">🎉 No active bookings at the moment! 🎉</p>;
    }

    return (
        <div className="bookings-grid">
            {activeBookings.map(booking => {
                const cycleEndDate = getBookingCycleEnd(booking.checkIn);
                const isOverdue = cycleEndDate && new Date() > cycleEndDate;

                return (
                    <div key={booking.id} className={`booking-card ${isOverdue ? 'overdue' : ''}`}>
                        <div className="card-header">
                            <h4>Room {booking.roomNo}</h4>
                            {isOverdue && <span className="overdue-banner">Overdue</span>}
                        </div>
                        <div className="card-body">
                            <div className="detail-item">
                                <span>📞</span> <strong>{booking.customerPhone}</strong>
                            </div>
                            <div className="detail-item">
                                <span>💰</span> <strong>${parseFloat(booking.amount).toFixed(2)}</strong>
                            </div>
                            <div className="detail-item">
                                <span>➡️</span> <strong>{formatDate(booking.checkIn?.toDate())}</strong>
                            </div>
                            {cycleEndDate && (
                                <div className="detail-item">
                                    <span>⏳</span> <strong>{formatDate(cycleEndDate)}</strong>
                                </div>
                            )}
                        </div>
                        <div className="card-footer">
                            {isOverdue ? (
                                <>
                                    <button onClick={() => handleAlreadyCheckout(booking.id, booking.roomId, cycleEndDate)} className="btn btn-secondary">Already Left</button>
                                    <button onClick={() => handleExtendStay(booking, cycleEndDate)} className="btn btn-extend">Extend Stay</button>
                                </>
                            ) : (
                                <button onClick={() => handleCheckout(booking.id, booking.roomId)} className="btn btn-checkout">Checkout</button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// #####################################################################
// ## Main Page Component
// #####################################################################
const ActiveBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingsCollection = collection(db, "bookings");
    const unsubBookings = onSnapshot(bookingsCollection, (snapshot) => {
        const bookingsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        // Sort by room number to maintain a consistent order
        bookingsData.sort((a, b) => a.roomNo - b.roomNo);
        setBookings(bookingsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching bookings: ", error);
        setLoading(false);
    });
    return () => unsubBookings();
  }, []);

  return (
    <>
      <style>{styles}</style> {/* Injects the CSS into the page */}
      <div className="bookings-container">
        <h1>Active Bookings</h1>
        <hr/>
        <section>
          {loading ? (
            <p>Loading active bookings...</p>
          ) : (
            <ActiveBookingsList bookings={bookings} />
          )}
        </section>
      </div>
    </>
  );
};

export default ActiveBookingsPage;