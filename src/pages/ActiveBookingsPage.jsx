import React, { useEffect, useState } from "react";
import LoadingAnimation from "../components/LoadingAnimation";
import { db } from "../config/firebase";
import { collection, onSnapshot, updateDoc, doc, runTransaction, serverTimestamp, Timestamp } from "firebase/firestore";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { motion } from 'framer-motion';
import {
  StyledContainer,
  PageHeader,
  StyledCard,
  ActionButton,
  ResponsiveGrid,
  LoadingSpinner,
  StatusBadge,
  ModalStyled,
  EmptyState
} from "../components/StyledComponents";
import { 
  FaClipboardCheck, 
  FaUser, 
  FaPhone, 
  FaRupeeSign, 
  FaClock, 
  FaUsers,
  FaSignOutAlt,
  FaPlus,
  FaExclamationTriangle
} from "react-icons/fa";

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
      <LoadingAnimation text="Loading active bookings..." />
    );
  }

  return (
    <StyledContainer fluid>
      <PageHeader>
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="mb-2">
                <FaClipboardCheck className="me-3" />
                Active Bookings
              </h1>
              <p className="mb-0">
                Manage currently active guest bookings and check-outs
              </p>
            </Col>
            <Col lg={4} className="mt-3 mt-lg-0 text-lg-end">
              <div className="d-flex align-items-center justify-content-lg-end gap-3">
                <div className="text-white">
                  <small>Active: </small>
                  <strong>{activeBookings.length}</strong>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </PageHeader>

      {activeBookings.length > 0 ? (
        <ResponsiveGrid>
          {activeBookings.map((booking, index) => {
            const cycleEndDate = getBookingCycleEnd(booking.checkIn);
            const isOverdue = cycleEndDate && new Date() > cycleEndDate;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <StyledCard className={`h-100 ${isOverdue ? 'border-danger border-2' : 'border-success border-2'}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title mb-0">
                        Room {booking.roomNo}
                      </h5>
                      <StatusBadge className={isOverdue ? 'status-extended' : 'status-active'}>
                        {isOverdue ? <FaExclamationTriangle /> : <FaClipboardCheck />}
                        {isOverdue ? 'Overdue' : 'Active'}
                      </StatusBadge>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaUser className="text-muted me-2" />
                        <strong>{booking.guestName}</strong>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <FaPhone className="text-muted me-2" />
                        <span>{booking.customerPhone}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <FaRupeeSign className="text-success me-2" />
                        <strong className="text-success">₹{parseFloat(booking.amount).toLocaleString()}</strong>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <FaClock className="text-muted me-2" />
                        <small>{formatDate(booking.checkIn?.toDate())}</small>
                      </div>
                      {cycleEndDate && (
                        <div className="d-flex align-items-center mb-2">
                          <FaClock className={`me-2 ${isOverdue ? 'text-danger' : 'text-warning'}`} />
                          <small className={isOverdue ? 'text-danger fw-bold' : 'text-warning'}>
                            Cycle ends: {formatDate(cycleEndDate)}
                          </small>
                        </div>
                      )}
                      <div className="d-flex align-items-center">
                        <FaUsers className="text-muted me-2" />
                        <span>{booking.numberOfPersons || 1} guest{(booking.numberOfPersons || 1) > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-footer bg-light d-flex justify-content-end gap-2">
                    {isOverdue ? (
                      <>
                        <ActionButton 
                          size="sm" 
                          variant="outline-danger" 
                          onClick={() => handleAlreadyCheckout(booking.id, booking.roomId, cycleEndDate)}
                        >
                          <FaSignOutAlt className="me-1" />
                          Already Left
                        </ActionButton>
                        <ActionButton 
                          size="sm" 
                          variant="primary" 
                          onClick={() => handleOpenExtendDialog(booking)}
                        >
                          <FaPlus className="me-1" />
                          Extend
                        </ActionButton>
                      </>
                    ) : (
                      <ActionButton 
                        size="sm" 
                        variant="success" 
                        onClick={() => handleCheckout(booking.id, booking.roomId)}
                      >
                        <FaSignOutAlt className="me-1" />
                        Checkout
                      </ActionButton>
                    )}
                  </div>
                </StyledCard>
              </motion.div>
            );
          })}
        </ResponsiveGrid>
      ) : (
        <EmptyState>
          <FaClipboardCheck className="empty-icon" />
          <h4>No Active Bookings</h4>
          <p>All rooms are currently available. New bookings will appear here.</p>
        </EmptyState>
      )}

      {/* Extend Stay Modal */}
      <ModalStyled>
        {extendDialog.open && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <FaPlus className="me-2" />
                    Extend Stay - Room {extendDialog.booking?.roomNo}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseExtendDialog}></button>
                </div>
                <div className="modal-body">
                  <div className="text-center mb-4">
                    <FaUser size={48} className="text-primary mb-3" />
                    <h6>{extendDialog.booking?.guestName}</h6>
                    <p className="text-muted">Enter the amount for the extended stay period</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label fw-bold">Extension Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      value={extendAmount}
                      onChange={(e) => setExtendAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <ActionButton variant="secondary" onClick={handleCloseExtendDialog}>
                    Cancel
                  </ActionButton>
                  <ActionButton variant="primary" onClick={handleExtendStay}>
                    <FaPlus className="me-2" />
                    Extend Stay
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalStyled>
    </StyledContainer>
  );
};

export default ActiveBookingsPage;
