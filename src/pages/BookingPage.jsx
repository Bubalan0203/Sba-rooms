import React, { useEffect, useState, useMemo } from "react";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

const BookingPage = () => {
  const roomsCollection = useMemo(() => collection(db, "rooms"), []);
  const bookingsCollection = useMemo(() => collection(db, "bookings"), []);

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [name, setName] = useState("");
  const [pricePerRoom, setPricePerRoom] = useState(2000);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomPrices, setRoomPrices] = useState({});
  const [proofImage, setProofImage] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [extendBookingData, setExtendBookingData] = useState(null);

  /** TEST MODE CONFIG **/
  const TEST_MODE = true; // set false in production
  const TEST_CHECKOUT_HOUR = 22; // 10 PM

  // Fetch rooms & bookings in real-time
  useEffect(() => {
    const unsubscribeRooms = onSnapshot(roomsCollection, (snapshot) => {
      setRooms(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeBookings = onSnapshot(bookingsCollection, (snapshot) => {
      setBookings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeRooms();
      unsubscribeBookings();
    };
  }, [roomsCollection, bookingsCollection]);

  // File upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProofImage(reader.result);
    reader.readAsDataURL(file);
  };

  // Select/unselect room
  const handleRoomSelect = (room) => {
    let updated;
    if (selectedRooms.some((r) => r.id === room.id)) {
      updated = selectedRooms.filter((r) => r.id !== room.id);
    } else {
      updated = [...selectedRooms, room];
    }
    setSelectedRooms(updated);

    const prices = { ...roomPrices };
    if (!prices[room.id]) prices[room.id] = pricePerRoom;
    setRoomPrices(prices);
  };

  const handleBasePriceChange = (e) => {
    let value = parseInt(e.target.value) || 0;
    if (value < 1) value = 1;
    setPricePerRoom(value);

    const updated = { ...roomPrices };
    selectedRooms.forEach((room) => {
      updated[room.id] = value;
    });
    setRoomPrices(updated);
  };

  const handleRoomPriceChange = (roomId, value) => {
    let val = parseInt(value) || 0;
    if (val < 1) val = 1;
    setRoomPrices({ ...roomPrices, [roomId]: val });
  };

  const getNextDay12PM = () => {
    const now = new Date();
    const next12 = new Date(now);
    next12.setHours(12, 0, 0, 0);
    if (now >= next12) next12.setDate(next12.getDate() + 1);
    return next12;
  };

  // Create booking
  const handleBooking = async (e) => {
    e.preventDefault();
    if (selectedRooms.length === 0) return alert("Select at least one room.");
    if (!name.trim()) return alert("Customer name required.");
    if (!proofImage) return alert("Proof image required.");

    const checkIn = new Date();
    const checkOut = getNextDay12PM();

    for (const room of selectedRooms) {
      await addDoc(bookingsCollection, {
        roomId: room.id,
        roomNo: room.roomNo,
        name,
        noOfPersons: 1,
        proofImage,
        totalAmount: Number(roomPrices[room.id]),
        bookingTime: serverTimestamp(),
        checkInTime: checkIn,
        checkOutTime: checkOut,
        status: "Booked",
      });
      await updateDoc(doc(db, "rooms", room.id), { status: "Booked" });
    }

    setName("");
    setPricePerRoom(2000);
    setSelectedRooms([]);
    setRoomPrices({});
    setProofImage("");
    setShowBookingForm(false);
  };

  // Already checkout
  const handleCheckout = async (booking) => {
    await updateDoc(doc(db, "bookings", booking.id), {
      status: "Checked Out",
      checkOutTime: serverTimestamp(),
    });
    await updateDoc(doc(db, "rooms", booking.roomId), { status: "Available" });
  };

  // Extend stay - open form
  const handleExtendStay = (booking) => {
    setExtendBookingData({ ...booking });
  };

  // Confirm extend stay
  const confirmExtendStay = async () => {
    if (!extendBookingData) return;

    // 1️⃣ Old booking checkout at fixed cut-off
    const oldCheckout = new Date();
    oldCheckout.setHours(TEST_MODE ? TEST_CHECKOUT_HOUR : 12, 0, 0, 0);

    await updateDoc(doc(db, "bookings", extendBookingData.id), {
      status: "Checked Out",
      checkOutTime: oldCheckout,
    });

    // 2️⃣ New booking check-in = old checkout + 1 min
    const newCheckIn = new Date(oldCheckout);
    newCheckIn.setMinutes(newCheckIn.getMinutes() + 1);

    await addDoc(bookingsCollection, {
      roomId: extendBookingData.roomId,
      roomNo: extendBookingData.roomNo,
      name: extendBookingData.name,
      noOfPersons: extendBookingData.noOfPersons,
      proofImage: extendBookingData.proofImage,
      totalAmount: extendBookingData.totalAmount,
      bookingTime: serverTimestamp(),
      checkInTime: newCheckIn,
      checkOutTime: null,
      status: "Booked",
    });

    // 3️⃣ Keep room booked (no availability change)
    await updateDoc(doc(db, "rooms", extendBookingData.roomId), {
      status: "Booked",
    });

    setExtendBookingData(null);
  };

  const activeBookings = bookings.filter((b) => b.status === "Booked");
  const availableRooms = rooms.filter((room) => room.status === "Available");

  return (
    <div>
      <h2>All Rooms</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {rooms.map((room) => (
          <div
            key={room.id}
            style={{
              border: "1px solid gray",
              margin: 5,
              padding: 5,
              width: 150,
            }}
          >
            <p>
              {room.roomNo} ({room.roomType})
            </p>
            <p>Status: {room.status}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowBookingForm(true)}
        disabled={availableRooms.length === 0}
      >
        Book Rooms
      </button>

      {showBookingForm && (
        <form onSubmit={handleBooking} style={{ marginTop: 10 }}>
          <h3>Booking Details</h3>
          <input
            type="text"
            placeholder="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Base Price per Room"
            value={pricePerRoom}
            onChange={handleBasePriceChange}
            min={1}
            required
          />
          <input type="file" onChange={handleFileUpload} required />

          <h4>Select Rooms</h4>
          {availableRooms.map((room) => (
            <div key={room.id} style={{ display: "flex", gap: 10 }}>
              <input
                type="checkbox"
                checked={selectedRooms.some((r) => r.id === room.id)}
                onChange={() => handleRoomSelect(room)}
              />
              <span>
                {room.roomNo} ({room.roomType})
              </span>
              {selectedRooms.some((r) => r.id === room.id) && (
                <input
                  type="number"
                  value={roomPrices[room.id] || pricePerRoom}
                  onChange={(e) =>
                    handleRoomPriceChange(room.id, e.target.value)
                  }
                  min={1}
                />
              )}
            </div>
          ))}

          <button type="submit" style={{ marginTop: 10 }}>
            Confirm Booking
          </button>
        </form>
      )}

      <h2>Active Bookings</h2>
      {activeBookings.length === 0 && <p>No active bookings.</p>}
      {activeBookings.map((booking) => {
        const now = new Date();
        let checkoutDate;
        if (TEST_MODE) {
          checkoutDate = new Date();
          checkoutDate.setHours(TEST_CHECKOUT_HOUR, 0, 0, 0);
        } else {
          checkoutDate = booking.checkOutTime?.toDate
            ? booking.checkOutTime.toDate()
            : new Date(booking.checkOutTime);
        }
        const isTimeExceeded = now > checkoutDate;

        return (
          <div
            key={booking.id}
            style={{
              border: "1px solid gray",
              margin: 5,
              padding: 5,
              backgroundColor: isTimeExceeded ? "#ffdddd" : "white",
            }}
          >
            <p>Room: {booking.roomNo}</p>
            <p>Name: {booking.name}</p>
            <p>Total Amount: ₹{booking.totalAmount}</p>
            <p>
              Check-in:{" "}
              {booking.checkInTime?.toDate
                ? booking.checkInTime.toDate().toLocaleString()
                : "Loading..."}
            </p>

            {isTimeExceeded ? (
              <>
                <button
                  style={{ backgroundColor: "red", color: "white" }}
                  onClick={() => handleCheckout(booking)}
                >
                  Already Checked Out
                </button>
                <button
                  style={{ backgroundColor: "orange", marginLeft: 5 }}
                  onClick={() => handleExtendStay(booking)}
                >
                  Extend Stay
                </button>
              </>
            ) : (
              <button onClick={() => handleCheckout(booking)}>
                Check Out
              </button>
            )}
          </div>
        );
      })}

      {extendBookingData && (
        <div style={{ border: "1px solid black", padding: 10 }}>
          <h3>Extend Stay for Room {extendBookingData.roomNo}</h3>
          <p>Name: {extendBookingData.name}</p>
          <input
            type="number"
            value={extendBookingData.totalAmount}
            onChange={(e) =>
              setExtendBookingData({
                ...extendBookingData,
                totalAmount: Number(e.target.value),
              })
            }
          />
          <br />
          <button onClick={confirmExtendStay}>Confirm Extension</button>
          <button onClick={() => setExtendBookingData(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default BookingPage;