import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import jsPDF from "jspdf";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  LinearProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Hotel as HotelIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AllBookingsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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

  const formatTimestamp = (timestamp) => {
    return timestamp?.toDate ? timestamp.toDate().toLocaleString() : "N/A";
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
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
    doc.text(`Total Amount Paid: ₹${booking.amount}`, 20, 120);
    doc.setFont("helvetica", "normal");

    doc.setFontSize(10);
    doc.text("Thank you for your stay at SBA Rooms!", 105, 140, null, null, "center");

    doc.save(`SBA-Rooms-Bill-${booking.roomNo}-${booking.id.slice(0, 5)}.pdf`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return theme.palette.success.main;
      case 'Completed': return theme.palette.info.main;
      case 'Extended': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return '🟢';
      case 'Completed': return '✅';
      case 'Extended': return '🔄';
      default: return '⚪';
    }
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomNo?.toString().includes(searchTerm) ||
      booking.customerPhone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: bookings.length,
    active: bookings.filter(b => b.status === 'Active').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.amount || 0), 0),
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
            <HistoryIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              All Bookings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete history of all guest bookings and transactions
            </Typography>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.primary.main}30` }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light + '30', color: theme.palette.primary.main, mx: 'auto', mb: 1, width: 40, height: 40 }}>
                  <HistoryIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Bookings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.success.main}30` }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.success.light + '30', color: theme.palette.success.main, mx: 'auto', mb: 1, width: 40, height: 40 }}>
                  <HotelIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  {stats.active}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.info.main}30` }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.info.light + '30', color: theme.palette.info.main, mx: 'auto', mb: 1, width: 40, height: 40 }}>
                  <CalendarIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                  {stats.completed}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.warning.main}30` }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.warning.light + '30', color: theme.palette.warning.main, mx: 'auto', mb: 1, width: 40, height: 40 }}>
                  <MoneyIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                  ₹{stats.totalRevenue.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by guest name, room, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Extended">Extended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={5}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Room
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Guest Details
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Check-In
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking, index) => (
                    <TableRow
                      key={booking.id}
                      sx={{
                        '&:hover': { bgcolor: theme.palette.action.hover },
                        borderLeft: `4px solid ${getStatusColor(booking.status)}30`,
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, fontSize: '0.875rem' }}>
                            {booking.roomNo}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Room {booking.roomNo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {booking.guestName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.customerPhone}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {booking.numberOfPersons} guest{booking.numberOfPersons > 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {booking.checkIn?.toDate ? booking.checkIn.toDate().toLocaleDateString() : 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.checkIn?.toDate ? booking.checkIn.toDate().toLocaleTimeString() : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          size="small"
                          sx={{
                            bgcolor: `${getStatusColor(booking.status)}20`,
                            color: getStatusColor(booking.status),
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                          ₹{booking.amount?.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(booking)}
                              sx={{
                                color: theme.palette.primary.main,
                                '&:hover': { bgcolor: `${theme.palette.primary.main}20` },
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Bill">
                            <IconButton
                              size="small"
                              onClick={() => handleGenerateBill(booking)}
                              sx={{
                                color: theme.palette.success.main,
                                '&:hover': { bgcolor: `${theme.palette.success.main}20` },
                              }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                      <HistoryIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No bookings found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || statusFilter !== 'All' 
                          ? 'Try adjusting your search or filter criteria'
                          : 'Bookings will appear here once guests check in'
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </motion.div>

      {/* Booking Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
          Booking Details - Room {selectedBooking?.roomNo}
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.grey[50] }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    Guest Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Guest Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedBooking.guestName}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedBooking.customerPhone}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Number of Persons</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedBooking.numberOfPersons}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip
                      label={selectedBooking.status}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(selectedBooking.status)}20`,
                        color: getStatusColor(selectedBooking.status),
                        fontWeight: 600,
                        mt: 0.5,
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.grey[50] }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="primary" />
                    Booking Timeline
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Check-In Time</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatTimestamp(selectedBooking.checkIn)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Check-Out Time</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedBooking.checkOut ? formatTimestamp(selectedBooking.checkOut) : "Not Checked Out"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      ₹{selectedBooking.amount?.toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              
              {selectedBooking.idProof && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.grey[50] }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      ID Proof
                    </Typography>
                    <Box
                      component="img"
                      src={selectedBooking.idProof}
                      alt="ID Proof"
                      sx={{
                        width: '100%',
                        maxWidth: 400,
                        height: 'auto',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                      }}
                    />
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => handleGenerateBill(selectedBooking)}
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ textTransform: 'none', borderRadius: 2, mr: 1 }}
          >
            Download Bill
          </Button>
          <Button
            onClick={handleCloseDialog}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AllBookingsPage;