import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const AllBookingsPage = () => {
  const bookingsCollection = collection(db, "bookings");
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(bookingsCollection, (snapshot) => {
      setBookings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>All Bookings</h2>
      {bookings.length === 0 && <p>No bookings found.</p>}
      {bookings.map((booking) => (
        <div
          key={booking.id}
          style={{ border: "1px solid gray", margin: "5px", padding: "5px" }}
        >
          <p>Room: {booking.roomNo}</p>
          <p>Name: {booking.name}</p>
          <p>Persons: {booking.noOfPersons}</p>
          <p>Total Amount: ₹{booking.totalAmount}</p>
          <p>
            Booking Time:{" "}
            {booking.bookingTime?.toDate
              ? booking.bookingTime.toDate().toLocaleString()
              : "Loading..."}
          </p>
          {booking.checkoutTime && (
            <p>
              Checkout Time: {booking.checkoutTime.toDate().toLocaleString()}
            </p>
          )}
          <p>Status: {booking.status}</p>
          {booking.proofImage && (
            <img src={booking.proofImage} alt="Proof" width="100" />
          )}
        </div>
      ))}
    </div>
  );
};

export default AllBookingsPage;