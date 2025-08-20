import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus, FaBed, FaSnowflake, FaWind, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomNo, setRoomNo] = useState("");
  const [roomType, setRoomType] = useState("AC");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Firestore rooms collection
  const roomsCollection = collection(db, "rooms");

  useEffect(() => {
    const q = query(roomsCollection, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomsData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const resetForm = () => {
    setRoomNo("");
    setRoomType("AC");
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomNo.trim()) return;

    if (editId) {
      const roomRef = doc(db, "rooms", editId);
      await updateDoc(roomRef, {
        roomNo,
        roomType,
        updatedAt: serverTimestamp()
      });
    } else {
      await addDoc(roomsCollection, {
        roomNo,
        roomType,
        status: "Available",
        createdAt: serverTimestamp()
      });
    }
    resetForm();
  };

  const handleEdit = (room) => {
    setEditId(room.id);
    setRoomNo(room.roomNo);
    setRoomType(room.roomType);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenDeleteModal = (id) => {
    setRoomToDelete(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setRoomToDelete(null);
  };

  const confirmDelete = async () => {
    if (roomToDelete) {
      await deleteDoc(doc(db, "rooms", roomToDelete));
    }
    handleCloseDeleteModal();
  };

  const getRoomIcon = (type) => {
    return type === "AC" ? <FaSnowflake /> : <FaWind />;
  };

  const getStatusBadge = (status) => {
    return status === "Available" ? (
      <span className="badge bg-success"><FaCheckCircle /> Available</span>
    ) : (
      <span className="badge bg-danger"><FaTimesCircle /> Booked</span>
    );
  };

  if (loading) {
    return (
      <div className="container text-center my-5">
        <Spinner animation="border" role="status" />
        <p className="mt-2">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Room Management</h2>
          <p className="text-muted">Manage your hotel rooms and their availability.</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <FaPlus className="me-2" /> Add New Room
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5>{editId ? "Edit Room" : "Add New Room"}</h5>
            <Form onSubmit={handleSubmit}>
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label>Room Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={roomNo}
                      onChange={(e) => setRoomNo(e.target.value)}
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label>Room Type</Form.Label>
                    <Form.Select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                    >
                      <option value="AC">AC Room</option>
                      <option value="Non-AC">Non-AC Room</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-4 d-flex gap-2">
                  <Button type="submit" variant="success">
                    {editId ? "Update" : "Add Room"}
                  </Button>
                  <Button variant="secondary" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      <h5>All Rooms ({rooms.length})</h5>
      {rooms.length > 0 ? (
        <div className="row">
          {rooms.map((room) => (
            <div className="col-md-3 mb-3" key={room.id}>
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between mb-2">
                    <div className="text-primary"><FaBed /></div>
                    {getStatusBadge(room.status)}
                  </div>
                  <h6>Room {room.roomNo}</h6>
                  <div className="text-muted">{getRoomIcon(room.roomType)} {room.roomType}</div>
                  <div className="mt-auto d-flex justify-content-end gap-2">
                    <Button size="sm" variant="outline-primary" onClick={() => handleEdit(room)}>
                      <FaEdit />
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleOpenDeleteModal(room.id)}>
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 border rounded">
          <FaBed size={40} className="text-muted mb-2" />
          <h6>No rooms found</h6>
          <p className="text-muted">Get started by adding your first room.</p>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <FaPlus className="me-2" /> Add First Room
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to permanently delete this room? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Mobile FAB */}
      <Button
        className="d-md-none rounded-circle position-fixed"
        style={{ bottom: "20px", right: "20px", width: "56px", height: "56px" }}
        onClick={() => {
          setShowForm(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <FaPlus />
      </Button>
    </div>
  );
}

export default RoomsPage;