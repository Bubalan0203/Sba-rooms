import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Phone, 
  DollarSign,
  X,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import jsPDF from "jspdf";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { formatCurrency, formatDate } from "../lib/utils";

const AllBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    const bookingsCollection = collection(db, "bookings");
    const unsubscribe = onSnapshot(bookingsCollection, (snapshot) => {
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by creation date, newest first
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

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone?.includes(searchTerm) ||
      booking.roomNo?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const handleGenerateBill = (booking) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text("SBA Rooms", 105, 20, null, null, "center");
    doc.setFontSize(16);
    doc.text("Invoice / Bill", 105, 30, null, null, "center");

    // Booking details
    doc.setFontSize(12);
    const checkInTime = booking.checkIn?.toDate ? booking.checkIn.toDate().toLocaleString() : "N/A";
    const checkOutTime = booking.checkOut?.toDate ? booking.checkOut.toDate().toLocaleString() : "Not Checked Out";

    doc.text(`Booking ID: ${booking.id}`, 20, 50);
    doc.text(`Room No: ${booking.roomNo}`, 20, 60);
    doc.text(`Guest Name: ${booking.guestName}`, 20, 70);
    doc.text(`Number of Persons: ${booking.numberOfPersons}`, 20, 80);
    doc.text(`Check-In: ${checkInTime}`, 20, 90);
    doc.text(`Check-Out: ${checkOutTime}`, 20, 100);

    doc.line(20, 110, 190, 110);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount Paid: ${formatCurrency(booking.amount)}`, 20, 120);
    doc.setFont("helvetica", "normal");

    doc.setFontSize(10);
    doc.text("Thank you for your stay at SBA Rooms!", 105, 140, null, null, "center");

    doc.save(`SBA-Rooms-Bill-${booking.roomNo}-${booking.id.slice(0, 5)}.pdf`);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Completed':
        return 'success';
      case 'Extended':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const BookingDetailsModal = () => {
    if (!selectedBooking) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border shadow-xl"
          >
            <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Booking Details</h2>
              <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Guest Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Guest Name</p>
                      <p className="font-medium">{selectedBooking.guestName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{selectedBooking.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Number of Persons</p>
                      <p className="font-medium">{selectedBooking.numberOfPersons}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={getStatusVariant(selectedBooking.status)}>
                        {selectedBooking.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Booking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Room Number</p>
                      <p className="font-medium">Room {selectedBooking.roomNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-medium text-green-600">{formatCurrency(selectedBooking.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Check-In Time</p>
                      <p className="font-medium">{formatDate(selectedBooking.checkIn?.toDate())}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Check-Out Time</p>
                      <p className="font-medium">
                        {selectedBooking.checkOut ? formatDate(selectedBooking.checkOut.toDate()) : "Not Checked Out"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ID Proof */}
              {selectedBooking.idProof && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      ID Proof
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={selectedBooking.idProof}
                      alt="ID Proof"
                      className="w-full max-w-md rounded-lg border shadow-sm"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button onClick={() => handleGenerateBill(selectedBooking)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Bill
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Bookings</h1>
            <p className="text-muted-foreground">Complete history of all bookings</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {bookings.length} Total Booking{bookings.length !== 1 ? 's' : ''}
          </Badge>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by guest name, phone, or room number..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Extended">Extended</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Bookings History</CardTitle>
              <CardDescription>
                {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "No bookings have been created yet"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Room</TableHead>
                          <TableHead>Guest</TableHead>
                          <TableHead>Check-In</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {paginatedBookings.map((booking, index) => (
                            <motion.tr
                              key={booking.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-muted/50"
                            >
                              <TableCell className="font-medium">
                                Room {booking.roomNo}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{booking.guestName}</p>
                                  <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatDate(booking.checkIn?.toDate())}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusVariant(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-green-600">
                                {formatCurrency(booking.amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewDetails(booking)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleGenerateBill(booking)}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Bill
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBookings.length)} of {filteredBookings.length} results
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal */}
        {showModal && <BookingDetailsModal />}
      </div>
    </div>
  );
};

export default AllBookingsPage;