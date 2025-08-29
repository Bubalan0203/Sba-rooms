import React, { useState, useEffect } from "react";
import LoadingAnimation from "../components/LoadingAnimation";
import { db } from "../config/firebase";
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
import {
  StyledContainer,
  PageHeader,
  StyledCard,
  ActionButton,
  LoadingSpinner,
  EmptyState,
  ModalStyled,
  FormCard
} from "../components/StyledComponents";
import { FaBook, FaBed, FaUser, FaCreditCard, FaCheck, FaPlus, FaCamera, FaImage, FaCheckCircle } from "react-icons/fa";
import imageCompression from "browser-image-compression";
function BookingPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successBookingData, setSuccessBookingData] = useState(null);

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
  const [showImageOptions, setShowImageOptions] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation errors
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

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
    setNameError("");
    setPhoneError("");
    setShowImageOptions(false);
  };

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name.trim()) {
      return "Name is required";
    }
    if (!nameRegex.test(name)) {
      return "Name should only contain alphabets and spaces";
    }
    return "";
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone.trim()) {
      return "Phone number is required";
    }
    if (!phoneRegex.test(phone)) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setGuestName(value);
    setNameError(validateName(value));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setGuestPhone(value);
      setPhoneError(validatePhone(value));
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setCommonAmount(value);
  };

  const handlePersonsChange = (roomId, value) => {
    const numericValue = value.replace(/\D/g, ''); // Only allow digits
    handleDetailChange(roomId, "numberOfPersons", numericValue);
  };

  const handleRoomAmountChange = (roomId, value) => {
    const numericValue = value.replace(/\D/g, ''); // Only allow digits
    handleDetailChange(roomId, "amount", numericValue);
  };
  const handleNext = () => {
    if (step === 0 && selectedRooms.length !== parseInt(numRooms, 10)) {
      alert(`Please select exactly ${numRooms} room(s).`);
      return;
    }
    if (step === 1) {
      const nameErr = validateName(guestName);
      const phoneErr = validatePhone(guestPhone);
      
      if (nameErr || phoneErr || !idProofBase64) {
        setNameError(nameErr);
        setPhoneError(phoneErr);
        if (!idProofBase64) {
          alert("Please upload ID proof");
        }
        return;
      }
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
    const newAmount = e.target.value.replace(/\D/g, ''); // Only allow digits
    setCommonAmount(newAmount);
    // Update all selected rooms with the common amount
    if (selectedRooms.length > 0) {
      setRoomDetails((prevDetails) => {
        const newDetails = { ...prevDetails };
        selectedRooms.forEach((roomId) => {
          newDetails[roomId] = { 
            ...newDetails[roomId], 
            amount: newAmount,
            numberOfPersons: newDetails[roomId]?.numberOfPersons || "1"
          };
        });
        return newDetails;
      });
    }
  };

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const options = {
        maxSizeMB: 0.5,        // target file size (0.5 MB)
        maxWidthOrHeight: 800, // resize if needed
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setIdProofBase64(reader.result);
        setShowImageOptions(false);
      };
    } catch (error) {
      console.error("Error compressing image:", error);
    }
  }
};

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => handleFileChange(e, true);
    input.click();
  };

  const handleGalleryUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png';
    input.onchange = handleFileChange;
    input.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nameErr = validateName(guestName);
    const phoneErr = validatePhone(guestPhone);
    
    if (nameErr || phoneErr || !idProofBase64) {
      setNameError(nameErr);
      setPhoneError(phoneErr);
      if (!idProofBase64) {
        alert("Please upload ID proof");
      }
      return;
    }
    
    setIsSubmitting(true);
    try {
      const bookingData = {
        rooms: selectedRooms.length,
        guestName,
        phone: `+91${guestPhone}`,
        totalAmount: totalAmount
      };
      
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
            customerPhone: `+91${guestPhone}`,
            idProof: idProofBase64,
            checkIn: serverTimestamp(),
            checkOut: null,
            status: "Active",
            createdAt: serverTimestamp(),
          });
          transaction.update(roomRef, { status: "Booked" });
        }
      });
      
      setSuccessBookingData(bookingData);
      setSuccessModalOpen(true);
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
      <LoadingAnimation text="Loading available rooms..." />
    );
  }

  return (
    <StyledContainer fluid>
      <PageHeader>
        <div className="container">
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="mb-2">
                <FaBook className="me-3" />
                Booking Management
              </h1>
              <p className="mb-0">
                Create new bookings and manage guest reservations
              </p>
            </Col>
            <Col lg={4} className="mt-3 mt-lg-0 text-lg-end">
              <ActionButton variant="light" onClick={handleOpenModal}>
                <FaPlus className="me-2" /> New Booking
              </ActionButton>
            </Col>
          </Row>
        </div>
      </PageHeader>

      {/* Header */}

      {/* Welcome Card */}
      <StyledCard className="text-center mb-4">
        <div className="card-body py-5">
          <FaBook size={64} className="text-primary mb-4 opacity-75" />
          <h4 className="fw-bold mb-3">Ready to Create a New Booking?</h4>
          <p className="text-muted mb-4 fs-5">
            Start the booking process by selecting available rooms and entering guest details.
          </p>
          <ActionButton variant="primary" size="lg" onClick={handleOpenModal}>
            <FaPlus className="me-2" />
            Create New Booking
          </ActionButton>
        </div>
      </StyledCard>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={6}>
          <StyledCard className="text-center">
            <div className="card-body">
              <FaBed size={32} className="text-primary mb-2" />
              <h5>{rooms.length}</h5>
              <small className="text-muted">Available Rooms</small>
            </div>
          </StyledCard>
        </Col>
        <Col md={6}>
          <StyledCard className="text-center">
            <div className="card-body">
              <FaCheck size={32} className="text-info mb-2" />
              <h5>2</h5>
              <small className="text-muted">Active Bookings</small>
            </div>
          </StyledCard>
        </Col>
      </Row>

      {/* Booking Modal */}
      <ModalStyled>
        <Modal show={modalOpen} onHide={handleCloseModal} size="xl" centered scrollable>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaBook className="me-2" />
              Create New Booking
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                {steps.map((stepName, index) => (
                  <small 
                    key={index} 
                    className={`fw-bold ${index <= step ? 'text-primary' : 'text-muted'}`}
                  >
                    {index + 1}. {stepName}
                  </small>
                ))}
              </div>
              <ProgressBar 
                now={((step + 1) / steps.length) * 100} 
                variant="primary"
                style={{ height: '6px' }}
              />
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1 */}
              {step === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="motion-div"
                >
                  <div className="d-flex align-items-center mb-4">
                    <FaBed className="text-primary me-2" size={24} />
                    <h5 className="mb-0">Select Rooms</h5>
                  </div>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Number of Rooms</Form.Label>
                    <Form.Select
                      value={numRooms}
                      onChange={(e) => {
                        setNumRooms(e.target.value);
                        setSelectedRooms([]);
                      }}
                      size="lg"
                    >
                      {[...Array(Math.min(10, rooms.length)).keys()].map((n) => (
                        <option key={n + 1} value={n + 1}>
                          {n + 1} Room{n > 0 ? "s" : ""}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <Row className="g-3">
                    {rooms.map((room) => (
                      <Col md={6} lg={4} key={room.id}>
                        <StyledCard
                          className={`h-100 ${
                            selectedRooms.includes(room.id)
                              ? "border-primary border-2"
                              : ""
                          }`}
                          onClick={() => handleRoomSelect(room.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="card-body text-center">
                            <FaBed size={32} className="text-primary mb-3" />
                            <h6>Room {room.roomNo}</h6>
                            <p className="text-muted mb-3">{room.roomType}</p>
                            <Form.Check
                              type="checkbox"
                              checked={selectedRooms.includes(room.id)}
                              disabled={
                                !selectedRooms.includes(room.id) &&
                                selectedRooms.length >= numRooms
                              }
                              readOnly
                            />
                          </div>
                        </StyledCard>
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
                  className="motion-div"
                >
                  <Row>
                    <Col lg={6}>
                      <div className="d-flex align-items-center mb-4">
                        <FaUser className="text-primary me-2" size={24} />
                        <h5 className="mb-0">Guest Information</h5>
                      </div>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Guest Name</Form.Label>
                        <Form.Control
                          size="lg"
                          value={guestName}
                          onChange={handleNameChange}
                          placeholder="Enter guest name"
                          isInvalid={!!nameError}
                        />
                        <Form.Control.Feedback type="invalid">
                          {nameError}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Phone Number</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">+91</span>
                        <Form.Control
                          size="lg"
                          value={guestPhone}
                            onChange={handlePhoneChange}
                          placeholder="Enter phone number"
                            maxLength={10}
                            isInvalid={!!phoneError}
                        />
                          <Form.Control.Feedback type="invalid">
                            {phoneError}
                          </Form.Control.Feedback>
                        </div>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">ID Proof</Form.Label>
                        <div className="d-grid gap-2">
                          <ActionButton
                            variant="outline-primary"
                            onClick={() => setShowImageOptions(!showImageOptions)}
                          >
                            <FaImage className="me-2" />
                            Upload ID Proof
                          </ActionButton>
                          
                          {showImageOptions && (
                            <div className="d-flex gap-2">
                              <ActionButton
                                variant="outline-success"
                                size="sm"
                                onClick={handleCameraCapture}
                                className="flex-fill"
                              >
                                <FaCamera className="me-2" />
                                Take Photo
                              </ActionButton>
                              <ActionButton
                                variant="outline-info"
                                size="sm"
                                onClick={handleGalleryUpload}
                                className="flex-fill"
                              >
                                <FaImage className="me-2" />
                                From Gallery
                              </ActionButton>
                            </div>
                          )}
                        </div>
                      </Form.Group>
                      
                      {idProofBase64 && (
                        <Alert variant="success" className="d-flex align-items-center">
                          <FaCheck className="me-2" />
                          ID Proof uploaded successfully
                        </Alert>
                      )}
                    </Col>
                    
                    <Col lg={6}>
                      <div className="d-flex align-items-center mb-4">
                        <FaCreditCard className="text-primary me-2" size={24} />
                        <h5 className="mb-0">Room Charges</h5>
                      </div>
                      
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Common Amount (₹)</Form.Label>
                        <Form.Control
                          type="number"
                          size="lg"
                          value={commonAmount}
                          onChange={handleAmountChange}
                          placeholder="Enter amount for all rooms"
                        />
                      </Form.Group>
                      
                      {selectedRooms.map((roomId) => {
                        const room = rooms.find((r) => r.id === roomId);
                        return (
                          <StyledCard key={roomId} className="mb-3">
                            <div className="card-body">
                              <h6 className="mb-3">Room {room.roomNo}</h6>
                              <Row>
                                <Col>
                                  <Form.Group>
                                    <Form.Label>Guests</Form.Label>
                                    <Form.Control
                                      type="text"
                                      placeholder="Number of persons"
                                      value={
                                        roomDetails[roomId]?.numberOfPersons || ""
                                      }
                                      onChange={(e) =>
                                        handlePersonsChange(roomId, e.target.value)
                                      }
                                    />
                                  </Form.Group>
                                </Col>
                                <Col>
                                  <Form.Group>
                                    <Form.Label>Amount (₹)</Form.Label>
                                    <Form.Control
                                      type="text"
                                      placeholder="Room amount"
                                      value={roomDetails[roomId]?.amount || ""}
                                      onChange={(e) =>
                                        handleRoomAmountChange(roomId, e.target.value)
                                      }
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                            </div>
                          </StyledCard>
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
                  className="motion-div"
                >
                  <div className="d-flex align-items-center mb-4">
                    <FaCheck className="text-primary me-2" size={24} />
                    <h5 className="mb-0">Review & Confirm</h5>
                  </div>
                  
                  <Row>
                    <Col lg={6}>
                      <StyledCard>
                        <div className="card-body">
                          <h6 className="mb-3">Guest Details</h6>
                          <div className="mb-2">
                            <strong>Name:</strong> {guestName}
                          </div>
                          <div className="mb-3">
                            <strong>Phone:</strong> +91{guestPhone}
                          </div>
                          {idProofBase64 && (
                            <div>
                              <strong>ID Proof:</strong>
                              <img
                                src={idProofBase64}
                                alt="ID Proof"
                                className="img-fluid mt-2 rounded"
                                style={{ maxWidth: 200 }}
                              />
                            </div>
                          )}
                        </div>
                      </StyledCard>
                    </Col>
                    
                    <Col lg={6}>
                      <StyledCard>
                        <div className="card-body">
                          <h6 className="mb-3">Booking Summary</h6>
                          <ListGroup variant="flush">
                            {selectedRooms.map((roomId) => {
                              const room = rooms.find((r) => r.id === roomId);
                              const finalAmount = parseFloat(
                                roomDetails[roomId]?.amount || commonAmount || 0
                              );
                              return (
                                <ListGroup.Item key={roomId} className="d-flex justify-content-between">
                                  <span>Room {room.roomNo}</span>
                                  <strong>₹{finalAmount.toLocaleString()}</strong>
                                </ListGroup.Item>
                              );
                            })}
                            <ListGroup.Item className="d-flex justify-content-between bg-light">
                              <strong>Total Amount</strong>
                              <strong className="text-success fs-5">₹{totalAmount.toLocaleString()}</strong>
                            </ListGroup.Item>
                          </ListGroup>
                        </div>
                      </StyledCard>
                    </Col>
                  </Row>
                </motion.div>
              )}
            </AnimatePresence>
          </Modal.Body>
          <Modal.Footer>
            <ActionButton
              variant="secondary"
              onClick={step === 0 ? handleCloseModal : handleBack}
            >
              {step === 0 ? "Cancel" : "Back"}
            </ActionButton>
            {step < steps.length - 1 ? (
              <ActionButton variant="primary" onClick={handleNext}>
                Next Step
              </ActionButton>
            ) : (
              <ActionButton
                variant="success"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheck className="me-2" />
                    Confirm Booking
                  </>
                )}
              </ActionButton>
            )}
          </Modal.Footer>
        </Modal>
      </ModalStyled>

      {/* Success Modal */}
      <ModalStyled>
        <Modal show={successModalOpen} onHide={() => setSuccessModalOpen(false)} centered>
          <Modal.Body className="text-center py-5">
            <div className="mb-4">
              <FaCheckCircle size={80} className="text-success" />
            </div>
            <h3 className="text-success mb-3">Booking Successful!</h3>
            {successBookingData && (
              <div className="text-start">
                <p><strong>Guest:</strong> {successBookingData.guestName}</p>
                <p><strong>Phone:</strong> {successBookingData.phone}</p>
                <p><strong>Rooms:</strong> {successBookingData.rooms}</p>
                <p><strong>Total Amount:</strong> ₹{successBookingData.totalAmount.toLocaleString()}</p>
              </div>
            )}
            <p className="text-muted mb-4">
              Your booking has been confirmed successfully. You can view it in the Active Bookings section.
            </p>
            <ActionButton 
              variant="success" 
              onClick={() => setSuccessModalOpen(false)}
              size="lg"
            >
              <FaCheck className="me-2" />
              Continue
            </ActionButton>
          </Modal.Body>
        </Modal>
      </ModalStyled>
    </StyledContainer>
  );
}

export default BookingPage;