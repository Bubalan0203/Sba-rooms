import React, { useEffect, useState } from "react";
import LoadingAnimation from "../components/LoadingAnimation";
import { db } from "../config/firebase";
import { Container, Row, Col, Spinner } from "react-bootstrap";
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
import { Modal, Button, Form } from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus, FaBed, FaSnowflake, FaWind, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import {
  StyledContainer,
  PageHeader,
  StyledCard,
  ActionButton,
  FloatingActionButton,
  ResponsiveGrid,
  EmptyState,
  LoadingSpinner,
  StatusBadge,
  FormCard,
  ModalStyled
} from "../components/StyledComponents";

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomNo, setRoomNo] = useState("");
  const [roomType, setRoomType] = useState("AC");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Modal states for alerts
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'info' });

  const showAlert = (title, message, type = 'info') => {
    setAlertModal({ show: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal({ show: false, title: '', message: '', type: 'info' });
  };

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
    if (!roomNo.trim()) {
      showAlert('Validation Error', 'Please enter a room number.', 'warning');
      return;
    }

    try {
      if (editId) {
        const roomRef = doc(db, "rooms", editId);
        await updateDoc(roomRef, {
          roomNo,
          roomType,
          updatedAt: serverTimestamp()
        });
        showAlert('Success', 'Room updated successfully!', 'success');
      } else {
        await addDoc(roomsCollection, {
          roomNo,
          roomType,
          status: "Available",
          createdAt: serverTimestamp()
        });
        showAlert('Success', 'Room added successfully!', 'success');
      }
      resetForm();
    } catch (error) {
      showAlert('Error', 'Failed to save room. Please try again.', 'error');
    }
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
      try {
        await deleteDoc(doc(db, "rooms", roomToDelete));
        showAlert('Success', 'Room deleted successfully!', 'success');
      } catch (error) {
        showAlert('Error', 'Failed to delete room. Please try again.', 'error');
      }
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
      <LoadingAnimation text="Loading rooms..." />
    );
  }

  return (
    <StyledContainer fluid>
      <PageHeader>
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="mb-2">
                <FaBed className="me-3" />
                Room Management
              </h1>
              <p className="mb-0">
                Manage your hotel rooms and their availability
              </p>
            </Col>
            <Col lg={4} className="mt-3 mt-lg-0 text-lg-end">
              <ActionButton variant="light" onClick={() => setShowForm(true)}>
                <FaPlus className="me-2" /> Add New Room
              </ActionButton>
            </Col>
          </Row>
        </Container>
      </PageHeader>

      {/* Header */}

      {/* Add/Edit Form */}
      {showForm && (
        <FormCard className="mb-4">
          <div className="card-header">
            <h5>{editId ? "Edit Room" : "Add New Room"}</h5>
          </div>
          <div className="card-body">
            <Form onSubmit={handleSubmit}>
              <Row className="g-3 align-items-end">
                <Col md={4}>
                  <Form.Group className="form-group">
                    <Form.Label>Room Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={roomNo}
                      onChange={(e) => setRoomNo(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="form-group">
                    <Form.Label>Room Type</Form.Label>
                    <Form.Select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                    >
                      <option value="AC">AC Room</option>
                      <option value="Non-AC">Non-AC Room</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex gap-2">
                  <ActionButton type="submit" variant="success">
                    {editId ? "Update" : "Add Room"}
                  </ActionButton>
                  <ActionButton variant="secondary" onClick={resetForm}>
                    Cancel
                  </ActionButton>
                </Col>
              </Row>
            </Form>
          </div>
        </FormCard>
      )}

      {/* Rooms Grid */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">All Rooms ({rooms.length})</h4>
        <div className="d-none d-lg-block">
          <small className="text-muted">
            {rooms.filter(r => r.status === 'Available').length} Available • {' '}
            {rooms.filter(r => r.status === 'Booked').length} Booked
          </small>
        </div>
      </div>
      
      {rooms.length > 0 ? (
        <ResponsiveGrid>
          {rooms.map((room) => (
            <StyledCard key={room.id} className="h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="text-primary fs-3">
                    <FaBed />
                  </div>
                  <StatusBadge className={`status-${room.status.toLowerCase()}`}>
                    {room.status === 'Available' ? <FaCheckCircle /> : <FaTimesCircle />}
                    {room.status}
                  </StatusBadge>
                </div>
                
                <h5 className="mb-2">Room {room.roomNo}</h5>
                <div className="text-muted mb-3 d-flex align-items-center">
                  {getRoomIcon(room.roomType)}
                  <span className="ms-2">{room.roomType}</span>
                </div>
                
                <div className="mt-auto d-flex justify-content-end gap-2">
                  <ActionButton 
                    size="sm" 
                    variant="outline-primary" 
                    onClick={() => handleEdit(room)}
                  >
                    <FaEdit />
                  </ActionButton>
                  <ActionButton 
                    size="sm" 
                    variant="outline-danger" 
                    onClick={() => handleOpenDeleteModal(room.id)}
                  >
                    <FaTrash />
                  </ActionButton>
                </div>
              </div>
            </StyledCard>
          ))}
        </ResponsiveGrid>
      ) : (
        <EmptyState>
          <FaBed className="empty-icon" />
          <h4>No rooms found</h4>
          <p>Get started by adding your first room to the system.</p>
          <ActionButton variant="primary" onClick={() => setShowForm(true)}>
            <FaPlus className="me-2" /> Add First Room
          </ActionButton>
        </EmptyState>
      )}

      {/* Delete Confirmation Modal */}
      <ModalStyled>
        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center py-3">
              <FaTrash size={48} className="text-danger mb-3" />
              <h5>Delete Room?</h5>
              <p className="text-muted">
                Are you sure you want to permanently delete this room? This action cannot be undone.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <ActionButton variant="secondary" onClick={handleCloseDeleteModal}>
              Cancel
            </ActionButton>
            <ActionButton variant="danger" onClick={confirmDelete}>
              <FaTrash className="me-2" />
              Delete Room
            </ActionButton>
          </Modal.Footer>
        </Modal>
      </ModalStyled>

      {/* Alert Modal */}
      <ModalStyled>
        <Modal show={alertModal.show} onHide={closeAlert} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {alertModal.type === 'error' && '⚠️ Error'}
              {alertModal.type === 'warning' && '⚠️ Warning'}
              {alertModal.type === 'info' && 'ℹ️ Information'}
              {alertModal.type === 'success' && '✅ Success'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-0">{alertModal.message}</p>
          </Modal.Body>
          <Modal.Footer>
            <ActionButton variant="primary" onClick={closeAlert}>
              OK
            </ActionButton>
          </Modal.Footer>
        </Modal>
      </ModalStyled>

      {/* Mobile FAB */}
      <FloatingActionButton
        variant="primary"
        onClick={() => {
          setShowForm(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <FaPlus />
      </FloatingActionButton>
    </StyledContainer>
  );
}

export default RoomsPage;