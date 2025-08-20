import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import jsPDF from "jspdf";
import {
  Row,
  Col,
  Modal,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import {
  StyledContainer,
  PageHeader,
  StyledCard,
  ActionButton,
  TableContainer,
  FilterBar,
  LoadingSpinner,
  StatusBadge,
  ModalStyled,
  StatsGrid,
  KPICard,
  EmptyState
} from "../components/StyledComponents";
import { 
  FaHistory, 
  FaDownload, 
  FaEye, 
  FaSearch, 
  FaFilter,
  FaRupeeSign,
  FaHotel,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaPhone
} from "react-icons/fa";

const AllBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const bookingsCollection = collection(db, "bookings");
    const unsubscribe = onSnapshot(bookingsCollection, (snapshot) => {
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      bookingsData.sort((a, b) => {
        const aDate = a.createdAt?.toDate() || new Date(0);
        const bDate = b.createdAt?.toDate() || new Date(0);
        return bDate - aDate;
      });
      setBookings(bookingsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatTimestamp = (timestamp) =>
    timestamp?.toDate ? timestamp.toDate().toLocaleString() : "N/A";

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleGenerateBill = (booking) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("SBA Rooms", 105, 20, null, null, "center");
    doc.setFontSize(16);
    doc.text("Invoice / Bill", 105, 30, null, null, "center");

    doc.setFontSize(12);
    const checkInTime = booking.checkIn?.toDate
      ? booking.checkIn.toDate().toLocaleString()
      : "N/A";
    const checkOutTime = booking.checkOut?.toDate
      ? booking.checkOut.toDate().toLocaleString()
      : "Not Checked Out";

    doc.text(`Booking ID: ${booking.id}`, 20, 50);
    doc.text(`Room No: ${booking.roomNo}`, 20, 60);
    doc.text(`Guest Name: ${booking.guestName}`, 20, 70);
    doc.text(`Number of Persons: ${booking.numberOfPersons}`, 20, 80);
    doc.text(`Check-In: ${checkInTime}`, 20, 90);
    doc.text(`Check-Out: ${checkOutTime}`, 20, 100);

    doc.line(20, 110, 190, 110);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount Paid: ₹${booking.amount}`, 20, 120);
    doc.setFont("helvetica", "normal");

    doc.setFontSize(10);
    doc.text(
      "Thank you for your stay at SBA Rooms!",
      105,
      140,
      null,
      null,
      "center"
    );

    doc.save(`SBA-Rooms-Bill-${booking.roomNo}-${booking.id.slice(0, 5)}.pdf`);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Completed":
        return "info";
      case "Extended":
        return "warning";
      default:
        return "secondary";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomNo?.toString().includes(searchTerm) ||
      booking.customerPhone?.includes(searchTerm);
    const matchesStatus =
      statusFilter === "All" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bookings.length,
    active: bookings.filter((b) => b.status === "Active").length,
    completed: bookings.filter((b) => b.status === "Completed").length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.amount || 0), 0),
  };

  if (loading) {
    return (
      <StyledContainer fluid>
        <LoadingSpinner>
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading booking history...</p>
        </LoadingSpinner>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer fluid>
      <PageHeader>
        <div className="container">
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="mb-2">
                <FaHistory className="me-3" />
                All Bookings
              </h1>
              <p className="mb-0">
                Complete history of all guest bookings and transactions
              </p>
            </Col>
            <Col lg={4} className="mt-3 mt-lg-0 text-lg-end">
              <div className="d-flex align-items-center justify-content-lg-end gap-3">
                <div className="text-white text-center">
                  <div><small>Total Revenue</small></div>
                  <div><strong>₹{stats.totalRevenue.toLocaleString()}</strong></div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </PageHeader>

      {/* Header */}

      {/* Stats */}
      <StatsGrid>
        <KPICard gradient="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)">
          <div className="kpi-icon"><FaHotel /></div>
          <h3>{stats.total}</h3>
          <div className="kpi-title">Total Bookings</div>
        </KPICard>
        
        <KPICard gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
          <div className="kpi-icon"><FaCheckCircle /></div>
          <h3>{stats.active}</h3>
          <div className="kpi-title">Active</div>
        </KPICard>
        
        <KPICard gradient="linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)">
          <div className="kpi-icon"><FaClock /></div>
          <h3>{stats.completed}</h3>
          <div className="kpi-title">Completed</div>
        </KPICard>
        
        <KPICard gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
          <div className="kpi-icon"><FaRupeeSign /></div>
          <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
          <div className="kpi-title">Total Revenue</div>
        </KPICard>
      </StatsGrid>

      {/* Filters */}
      <FilterBar>
        <Row className="g-3">
          <Col md={5}>
            <div className="position-relative">
              <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <Form.Control
                placeholder="Search by guest, room, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-5"
              />
            </div>
          </Col>
          <Col md={3}>
            <div className="position-relative">
              <FaFilter className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="ps-5"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Extended">Extended</option>
              </Form.Select>
            </div>
          </Col>
          <Col md={4} className="d-flex align-items-center">
            <small className="text-muted">
              Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
            </small>
          </Col>
        </Row>
      </FilterBar>

      {/* Bookings Table */}
      <TableContainer>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Guest Details</th>
                <th>Check-In</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaHotel className="text-primary me-2" />
                        <strong>Room {booking.roomNo}</strong>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="d-flex align-items-center mb-1">
                          <FaUser className="text-muted me-2" size={12} />
                          <strong>{booking.guestName}</strong>
                        </div>
                        <div className="d-flex align-items-center mb-1">
                          <FaPhone className="text-muted me-2" size={12} />
                          <small className="text-muted">{booking.customerPhone}</small>
                        </div>
                        <small className="text-muted">
                          {booking.numberOfPersons} guest
                          {booking.numberOfPersons > 1 ? "s" : ""}
                        </small>
                      </div>
                    </td>
                    <td>
                      <small>
                        {booking.checkIn?.toDate
                          ? booking.checkIn.toDate().toLocaleString()
                          : "N/A"}
                      </small>
                    </td>
                    <td>
                      <StatusBadge className={`status-${booking.status.toLowerCase()}`}>
                        {booking.status === 'Active' && <FaCheckCircle />}
                        {booking.status === 'Completed' && <FaClock />}
                        {booking.status === 'Extended' && <FaClock />}
                        {booking.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaRupeeSign className="text-success me-1" size={12} />
                        <strong className="text-success">
                          {booking.amount?.toLocaleString()}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <ActionButton
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleViewDetails(booking)}
                        >
                          <FaEye />
                        </ActionButton>
                        <ActionButton
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleGenerateBill(booking)}
                        >
                          <FaDownload />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState>
                      <FaHistory className="empty-icon" />
                      <h5>No bookings found</h5>
                      <p>Try adjusting your search or filter criteria</p>
                    </EmptyState>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TableContainer>

      {/* Booking Details Modal */}
      <ModalStyled>
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaEye className="me-2" />
              Booking Details - Room {selectedBooking?.roomNo}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedBooking && (
              <Row>
                <Col md={6}>
                  <StyledCard className="mb-3">
                    <div className="card-body">
                      <h6 className="mb-3">
                        <FaUser className="me-2 text-primary" />
                        Guest Information
                      </h6>
                      <div className="mb-2">
                        <strong>Name:</strong> {selectedBooking.guestName}
                      </div>
                      <div className="mb-2">
                        <strong>Phone:</strong> {selectedBooking.customerPhone}
                      </div>
                      <div className="mb-2">
                        <strong>Guests:</strong> {selectedBooking.numberOfPersons}
                      </div>
                      <div>
                        <strong>Status:</strong>{" "}
                        <StatusBadge className={`status-${selectedBooking.status.toLowerCase()}`}>
                          {selectedBooking.status}
                        </StatusBadge>
                      </div>
                    </div>
                  </StyledCard>
                </Col>
                <Col md={6}>
                  <StyledCard className="mb-3">
                    <div className="card-body">
                      <h6 className="mb-3">
                        <FaClock className="me-2 text-primary" />
                        Booking Timeline
                      </h6>
                      <div className="mb-2">
                        <strong>Check-In:</strong>{" "}
                        {formatTimestamp(selectedBooking.checkIn)}
                      </div>
                      <div className="mb-2">
                        <strong>Check-Out:</strong>{" "}
                        {selectedBooking.checkOut
                          ? formatTimestamp(selectedBooking.checkOut)
                          : "Not Checked Out"}
                      </div>
                      <div>
                        <strong>Amount:</strong>{" "}
                        <span className="text-success fw-bold fs-5">
                          ₹{selectedBooking.amount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </StyledCard>
                </Col>
                {selectedBooking.idProof && (
                  <Col md={12}>
                    <StyledCard>
                      <div className="card-body">
                        <h6 className="mb-3">ID Proof</h6>
                        <img
                          src={selectedBooking.idProof}
                          alt="ID Proof"
                          className="img-fluid rounded"
                          style={{ maxWidth: "400px" }}
                        />
                      </div>
                    </StyledCard>
                  </Col>
                )}
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            {selectedBooking && (
              <ActionButton
                variant="success"
                onClick={() => handleGenerateBill(selectedBooking)}
              >
                <FaDownload className="me-2" />
                Download Bill
              </ActionButton>
            )}
            <ActionButton variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </ActionButton>
          </Modal.Footer>
        </Modal>
      </ModalStyled>
    </StyledContainer>
  );
};

export default AllBookingsPage;
