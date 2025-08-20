import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import styled from "styled-components";
import {
  collection,
  onSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Card,
  ListGroup,
  Alert,
  Spinner,
  ProgressBar,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";

function BookingPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [step, setStep] = useState(0);
  const [numRooms, setNumRooms] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomDetails, setRoomDetails] = useState({});
  const [commonAmount, setCommonAmount] = useState("");

  // Guest Details
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [idProofBase64, setIdProofBase64] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = ["Select Rooms", "Guest & Payment Details", "Review & Confirm"];

  useEffect(() => {
    const roomsCollection = collection(db, "rooms");
    const q = query(roomsCollection, where("status", "==", "Available"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(0);
    setNumRooms(1);
    setSelectedRooms([]);
    setRoomDetails({});
    setCommonAmount("");
    setGuestName("");
    setGuestPhone("");
    setIdProofBase64("");
    setIsSubmitting(false);
  };

  const handleNext = () => {
    if (step === 0 && selectedRooms.length !== parseInt(numRooms, 10)) {
      alert(`Please select exactly ${numRooms} room(s).`);
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleRoomSelect = (roomId) => {
    setSelectedRooms((prev) => {
      const newSelection = prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId];

      newSelection.forEach((id) => {
        if (!roomDetails[id]) {
          setRoomDetails((prevDetails) => ({
            ...prevDetails,
            [id]: { numberOfPersons: "", amount: commonAmount },
          }));
        }
      });
      return newSelection;
    });
  };

  const handleDetailChange = (roomId, field, value) => {
    setRoomDetails((prev) => ({
      ...prev,
      [roomId]: { ...prev[roomId], [field]: value },
    }));
  };

  const handleCommonAmountChange = (e) => {
    const newAmount = e.target.value;
    setCommonAmount(newAmount);
    setRoomDetails((prevDetails) => {
      const newDetails = { ...prevDetails };
      selectedRooms.forEach((roomId) => {
        newDetails[roomId] = { ...newDetails[roomId], amount: newAmount };
      });
      return newDetails;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdProofBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guestName || !guestPhone || !idProofBase64) {
      alert("Cannot submit. Guest details are missing.");
      return;
    }
    setIsSubmitting(true);
    try {
      await runTransaction(db, async (transaction) => {
        const bookingsCollection = collection(db, "bookings");
        for (const roomId of selectedRooms) {
          const roomRef = doc(db, "rooms", roomId);
          const room = rooms.find((r) => r.id === roomId);
          const finalAmount = parseFloat(
            roomDetails[roomId]?.amount || commonAmount || 0
          );
          transaction.set(doc(bookingsCollection), {
            roomId: roomId,
            roomNo: room.roomNo,
            numberOfPersons: parseInt(
              roomDetails[roomId]?.numberOfPersons || 1,
              10
            ),
            amount: finalAmount,
            guestName: guestName,
            customerPhone: guestPhone,
            idProof: idProofBase64,
            checkIn: serverTimestamp(),
            checkOut: null,
            status: "Active",
            createdAt: serverTimestamp(),
          });
          transaction.update(roomRef, { status: "Booked" });
        }
      });
      alert("Booking successful!");
      handleCloseModal();
    } catch (error) {
      alert("Booking failed! The selected room(s) might have just been booked.");
      console.error("Transaction failed: ", error);
      setIsSubmitting(false);
    }
  };

  const totalAmount = selectedRooms.reduce((total, roomId) => {
    const amount = parseFloat(
      roomDetails[roomId]?.amount || commonAmount || 0
    );
    return total + amount;
  }, 0);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <ProgressBar animated now={60} style={{ maxWidth: 400, margin: "auto" }} />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-primary">Booking Management</h3>
          <p className="text-muted">Create new bookings and manage guest reservations</p>
        </div>
        <Button variant="primary" onClick={handleOpenModal}>
          + New Booking
        </Button>
      </div>

      {/* Welcome Card */}
      <Card className="text-center p-4 mb-4">
        <h5 className="fw-bold">Ready to Create a New Booking?</h5>
        <p className="text-muted">
          Click the "New Booking" button above to start the booking process.
        </p>
        <Button variant="outline-primary" onClick={handleOpenModal}>
          Get Started
        </Button>
      </Card>

      {/* Booking Modal */}
      <Modal show={modalOpen} onHide={handleCloseModal} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Create New Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AnimatePresence mode="wait">
            {/* Step 1 */}
            {step === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h6>Select Rooms</h6>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Rooms</Form.Label>
                  <Form.Select
                    value={numRooms}
                    onChange={(e) => {
                      setNumRooms(e.target.value);
                      setSelectedRooms([]);
                    }}
                  >
                    {[...Array(Math.min(10, rooms.length)).keys()].map((n) => (
                      <option key={n + 1} value={n + 1}>
                        {n + 1} Room{n > 0 ? "s" : ""}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Row>
                  {rooms.map((room) => (
                    <Col md={6} key={room.id}>
                      <Card
                        className={`mb-2 ${
                          selectedRooms.includes(room.id)
                            ? "border-primary"
                            : ""
                        }`}
                        onClick={() => handleRoomSelect(room.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <Card.Body>
                          <Form.Check
                            type="checkbox"
                            checked={selectedRooms.includes(room.id)}
                            label={`Room ${room.roomNo} (${room.roomType})`}
                            disabled={
                              !selectedRooms.includes(room.id) &&
                              selectedRooms.length >= numRooms
                            }
                          />
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Row>
                  <Col md={6}>
                    <h6>Guest Information</h6>
                    <Form.Group className="mb-2">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>ID Proof</Form.Label>
                      <Form.Control type="file" onChange={handleFileChange} />
                    </Form.Group>
                    {idProofBase64 && (
                      <Alert variant="success">ID Proof uploaded</Alert>
                    )}
                  </Col>
                  <Col md={6}>
                    <h6>Room Charges</h6>
                    <Form.Group className="mb-2">
                      <Form.Label>Common Amount</Form.Label>
                      <Form.Control
                        type="number"
                        value={commonAmount}
                        onChange={handleCommonAmountChange}
                      />
                    </Form.Group>
                    {selectedRooms.map((roomId) => {
                      const room = rooms.find((r) => r.id === roomId);
                      return (
                        <Card key={roomId} className="mb-2">
                          <Card.Body>
                            <strong>Room {room.roomNo}</strong>
                            <Row>
                              <Col>
                                <Form.Control
                                  type="number"
                                  placeholder="Persons"
                                  value={
                                    roomDetails[roomId]?.numberOfPersons || ""
                                  }
                                  onChange={(e) =>
                                    handleDetailChange(
                                      roomId,
                                      "numberOfPersons",
                                      e.target.value
                                    )
                                  }
                                />
                              </Col>
                              <Col>
                                <Form.Control
                                  type="number"
                                  placeholder="Amount"
                                  value={roomDetails[roomId]?.amount || ""}
                                  onChange={(e) =>
                                    handleDetailChange(
                                      roomId,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                />
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </Col>
                </Row>
              </motion.div>
            )}

            {/* Step 3 */}
            {step === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h6>Review & Confirm</h6>
                <Row>
                  <Col md={6}>
                    <Card>
                      <Card.Body>
                        <h6>Guest Details</h6>
                        <p><b>Name:</b> {guestName}</p>
                        <p><b>Phone:</b> {guestPhone}</p>
                        {idProofBase64 && (
                          <img
                            src={idProofBase64}
                            alt="ID Proof"
                            style={{ width: 150 }}
                          />
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <Card.Body>
                        <h6>Booking Summary</h6>
                        <ListGroup>
                          {selectedRooms.map((roomId) => {
                            const room = rooms.find((r) => r.id === roomId);
                            const finalAmount = parseFloat(
                              roomDetails[roomId]?.amount || commonAmount || 0
                            );
                            return (
                              <ListGroup.Item key={roomId}>
                                Room {room.roomNo} - ₹{finalAmount}
                              </ListGroup.Item>
                            );
                          })}
                          <ListGroup.Item className="fw-bold">
                            Total: ₹{totalAmount.toFixed(2)}
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </motion.div>
            )}
          </AnimatePresence>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={step === 0 ? handleCloseModal : handleBack}
          >
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < steps.length - 1 ? (
            <Button variant="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner animation="border" size="sm" /> : "Confirm Booking"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default BookingPage;
const StyledModal = styled(Modal)`
  .modal-dialog {
    max-width: 900px; /* wider modal */
  }

  .modal-content {
    border-radius: 16px;
    overflow: hidden;
  }

  .modal-header {
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  }

  .modal-body {
    padding: 1.5rem;
    max-height: 70vh;
    overflow-y: auto;
  }

  .modal-footer {
    background: #f8f9fa;
    border-top: 1px solid #dee2e6;
  }

  /* Room card styles */
  .card {
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .card.border-primary {
    border-width: 2px !important;
    box-shadow: 0 0 8px rgba(13, 110, 253, 0.4);
  }

  .card img {
    border-radius: 8px;
    margin-top: 10px;
  }

  /* Step animation area */
  .motion-div {
    min-height: 300px; /* prevent modal jump on step change */
  }
`;