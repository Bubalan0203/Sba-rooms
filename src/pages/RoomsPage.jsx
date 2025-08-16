import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomNo, setRoomNo] = useState("");
  const [roomType, setRoomType] = useState("AC");
  const [editId, setEditId] = useState(null);

  const roomsCollection = collection(db, "rooms"); // This is your Firestore collection

  // Fetch rooms in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(roomsCollection, (snapshot) => {
      const roomsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomsData);
    });
    return unsubscribe;
  }, []);

  // Add or update room

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!roomNo.trim()) {
    alert("Room number is required!");
    return;
  }

  if (editId) {
    // Update existing room
    const roomRef = doc(db, "rooms", editId);
    await updateDoc(roomRef, {
      roomNo,
      roomType,
      updatedAt: serverTimestamp()
    });
    setEditId(null);
  } else {
    // Add new room with default status = "Available"
    await addDoc(roomsCollection, {
      roomNo,
      roomType,
      status: "Available", // 👈 default field
      createdAt: serverTimestamp()
    });
  }

  setRoomNo("");
  setRoomType("AC");
};

  // Edit room
  const handleEdit = (room) => {
    setEditId(room.id);
    setRoomNo(room.roomNo);
    setRoomType(room.roomType);
  };

  // Delete room
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "rooms", id));
  };

  return (
    <div>
      <h2>Rooms Management</h2>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Room No"
          value={roomNo}
          onChange={(e) => setRoomNo(e.target.value)}
        />
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
        >
          <option value="AC">AC</option>
          <option value="Non-AC">Non-AC</option>
          <option value="Both">Both</option>
        </select>
        <button type="submit">{editId ? "Update Room" : "Add Room"}</button>
      </form>

      {/* Rooms List */}
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <strong>{room.roomNo}</strong> - {room.roomType}
            <button onClick={() => handleEdit(room)}>Edit</button>
            <button onClick={() => handleDelete(room.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RoomsPage;