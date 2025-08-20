import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import jsPDF from "jspdf";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  Spinner,
  Badge,
} from "react-bootstrap";

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
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <h2 className="fw-bold mb-3">All Bookings</h2>
      <p className="text-muted">
        Complete history of all guest bookings and transactions
      </p>

      {/* Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="p-3 text-center shadow-sm">
            <h5>{stats.total}</h5>
            <small>Total Bookings</small>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 text-center shadow-sm">
            <h5>{stats.active}</h5>
            <small>Active</small>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 text-center shadow-sm">
            <h5>{stats.completed}</h5>
            <small>Completed</small>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 text-center shadow-sm">
            <h5>₹{stats.totalRevenue.toLocaleString()}</h5>
            <small>Total Revenue</small>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={4}>
          <InputGroup>
            <Form.Control
              placeholder="Search by guest, room, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Extended">Extended</option>
          </Form.Select>
        </Col>
        <Col md={5} className="d-flex align-items-center">
          <small className="text-muted">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </small>
        </Col>
      </Row>

      {/* Bookings Table */}
      <Table bordered hover responsive className="shadow-sm">
        <thead>
          <tr className="table-light">
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
                  <strong>Room {booking.roomNo}</strong>
                </td>
                <td>
                  <div>
                    <strong>{booking.guestName}</strong>
                    <br />
                    <small>{booking.customerPhone}</small>
                    <br />
                    <small>
                      {booking.numberOfPersons} guest
                      {booking.numberOfPersons > 1 ? "s" : ""}
                    </small>
                  </div>
                </td>
                <td>
                  {booking.checkIn?.toDate
                    ? booking.checkIn.toDate().toLocaleString()
                    : "N/A"}
                </td>
                <td>
                  <Badge bg={getStatusVariant(booking.status)}>
                    {booking.status}
                  </Badge>
                </td>
                <td>
                  <strong className="text-success">
                    ₹{booking.amount?.toLocaleString()}
                  </strong>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => handleViewDetails(booking)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-success"
                    onClick={() => handleGenerateBill(booking)}
                  >
                    Bill
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-4 text-muted">
                No bookings found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Booking Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Booking Details - Room {selectedBooking?.roomNo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <Row>
              <Col md={6}>
                <Card className="p-3 mb-3">
                  <h6>Guest Information</h6>
                  <p>
                    <strong>Name:</strong> {selectedBooking.guestName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedBooking.customerPhone}
                  </p>
                  <p>
                    <strong>Guests:</strong> {selectedBooking.numberOfPersons}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Badge bg={getStatusVariant(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                  </p>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="p-3 mb-3">
                  <h6>Booking Timeline</h6>
                  <p>
                    <strong>Check-In:</strong>{" "}
                    {formatTimestamp(selectedBooking.checkIn)}
                  </p>
                  <p>
                    <strong>Check-Out:</strong>{" "}
                    {selectedBooking.checkOut
                      ? formatTimestamp(selectedBooking.checkOut)
                      : "Not Checked Out"}
                  </p>
                  <p>
                    <strong>Amount:</strong>{" "}
                    <span className="text-success fw-bold">
                      ₹{selectedBooking.amount?.toLocaleString()}
                    </span>
                  </p>
                </Card>
              </Col>
              {selectedBooking.idProof && (
                <Col md={12}>
                  <Card className="p-3">
                    <h6>ID Proof</h6>
                    <img
                      src={selectedBooking.idProof}
                      alt="ID Proof"
                      className="img-fluid rounded"
                      style={{ maxWidth: "400px" }}
                    />
                  </Card>
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedBooking && (
            <Button
              variant="success"
              onClick={() => handleGenerateBill(selectedBooking)}
            >
              Download Bill
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AllBookingsPage;
