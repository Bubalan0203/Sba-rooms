import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot, updateDoc, doc, runTransaction, serverTimestamp, Timestamp } from "firebase/firestore";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckoutIcon,
  ExtensionOutlined as ExtendIcon,
  Warning as WarningIcon,
  EventAvailable as ActiveIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const BOOKING_START_HOUR = 12;

const ActiveBookingsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
            <ActiveIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Active Bookings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage current guest stays and check-outs
            </Typography>
          </Box>
        </Box>
        
        {/* Stats */}
        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.primary.light + '20' }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  {activeBookings.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active Bookings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                  {activeBookings.filter(b => {
                    const cycleEnd = getBookingCycleEnd(b.checkIn);
                    return cycleEnd && new Date() > cycleEnd;
                  }).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Overdue
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  ₹{activeBookings.reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                  {Math.round(activeBookings.reduce((sum, b) => sum + (b.numberOfPersons || 1), 0) / Math.max(activeBookings.length, 1))}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg. Guests
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Bookings Grid */}
      {activeBookings.length > 0 ? (
        <Grid container spacing={3}>
          {activeBookings.map((booking, index) => {
            const cycleEndDate = getBookingCycleEnd(booking.checkIn);
            const isOverdue = cycleEndDate && new Date() > cycleEndDate;

            return (
              <Grid item xs={12} sm={6} lg={4} key={booking.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: theme.shadows[2],
                      border: isOverdue ? `2px solid ${theme.palette.error.main}` : `2px solid ${theme.palette.success.main}30`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                        borderColor: isOverdue ? theme.palette.error.main : theme.palette.success.main,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                            <HotelIcon />
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Room {booking.roomNo}
                          </Typography>
                        </Box>
                        <Chip
                          label={isOverdue ? "Overdue" : "Active"}
                          size="small"
                          icon={isOverdue ? <WarningIcon /> : <CheckoutIcon />}
                          sx={{
                            bgcolor: isOverdue ? `${theme.palette.error.main}20` : `${theme.palette.success.main}20`,
                            color: isOverdue ? theme.palette.error.main : theme.palette.success.main,
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      {/* Guest Info */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon sx={{ color: theme.palette.text.secondary, fontSize: '1.2rem' }} />
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {booking.guestName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PhoneIcon sx={{ color: theme.palette.text.secondary, fontSize: '1.2rem' }} />
                          <Typography variant="body2" color="text.secondary">
                            {booking.customerPhone}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <MoneyIcon sx={{ color: theme.palette.success.main, fontSize: '1.2rem' }} />
                          <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                            ₹{parseFloat(booking.amount).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Timing Info */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ScheduleIcon sx={{ color: theme.palette.info.main, fontSize: '1.2rem' }} />
                          <Typography variant="caption" color="text.secondary">
                            Check-in: {formatDate(booking.checkIn?.toDate())}
                          </Typography>
                        </Box>
                        {cycleEndDate && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon sx={{ color: isOverdue ? theme.palette.error.main : theme.palette.warning.main, fontSize: '1.2rem' }} />
                            <Typography variant="caption" color={isOverdue ? "error" : "text.secondary"}>
                              Cycle ends: {formatDate(cycleEndDate)}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Persons */}
                      <Chip
                        label={`${booking.numberOfPersons || 1} Guest${(booking.numberOfPersons || 1) > 1 ? 's' : ''}`}
                        size="small"
                        sx={{
                          bgcolor: theme.palette.info.light + '30',
                          color: theme.palette.info.main,
                        }}
                      />
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end', gap: 1 }}>
                      {isOverdue ? (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleAlreadyCheckout(booking.id, booking.roomId, cycleEndDate)}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                          >
                            Already Left
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<ExtendIcon />}
                            onClick={() => handleOpenExtendDialog(booking)}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                          >
                            Extend
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckoutIcon />}
                          onClick={() => handleCheckout(booking.id, booking.roomId)}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          Checkout
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: theme.palette.grey[50],
            border: `2px dashed ${theme.palette.grey[300]}`,
          }}
        >
          <ActiveIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.secondary }}>
            No Active Bookings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            All rooms are currently available. New bookings will appear here.
          </Typography>
        </Paper>
      )}

      {/* Extend Stay Dialog */}
      <Dialog
        open={extendDialog.open}
        onClose={handleCloseExtendDialog}
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Extend Stay - Room {extendDialog.booking?.roomNo}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the amount for the extended booking period for {extendDialog.booking?.guestName}.
          </Typography>
          <TextField
            label="Extension Amount"
            type="number"
            fullWidth
            value={extendAmount}
            onChange={(e) => setExtendAmount(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseExtendDialog} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleExtendStay}
            variant="contained"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Extend Stay
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ActiveBookingsPage;