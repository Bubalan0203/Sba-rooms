import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot, updateDoc, doc, runTransaction, serverTimestamp, Timestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  User, 
  Phone, 
  DollarSign, 
  LogOut, 
  Plus, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Users
} from "lucide-react";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { formatCurrency, formatDate } from "../lib/utils";

// Configuration
const BOOKING_START_HOUR = 12; // 12 for 12 PM

const ActiveBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleCheckout = async (bookingId, roomId) => {
    if (!window.confirm("Are you sure you want to check out this guest?")) return;
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(bookingRef, { checkOut: serverTimestamp(), status: 'Completed' });
      await updateDoc(roomRef, { status: 'Available' });
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Failed to checkout. Please try again.");
    }
  };

  const handleAlreadyCheckout = async (bookingId, roomId, cycleEndDate) => {
    if (!window.confirm("Mark this guest as checked out at the cycle end time?")) return;
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(bookingRef, { checkOut: Timestamp.fromDate(cycleEndDate), status: 'Completed' });
      await updateDoc(roomRef, { status: 'Available' });
    } catch (error) {
      console.error("Error marking as checked out:", error);
      alert("Failed to update booking. Please try again.");
    }
  };

  const handleExtendStay = async (booking, cycleEndDate) => {
    const newAmount = prompt(`Extend stay for Room ${booking.roomNo}.\nEnter amount for the new booking period:`, booking.amount);
    if (newAmount === null || isNaN(parseFloat(newAmount)) || parseFloat(newAmount) <= 0) {
        alert("Invalid amount. Extension cancelled.");
        return;
    }

    const { id, ...oldBookingData } = booking;
    const oldBookingRef = doc(db, "bookings", booking.id);
    const bookingsCollection = collection(db, "bookings");

    try {
        await runTransaction(db, async (transaction) => {
            transaction.update(oldBookingRef, { checkOut: Timestamp.fromDate(cycleEndDate), status: 'Extended' });
            
            const newCheckIn = new Date(cycleEndDate);
            transaction.set(doc(bookingsCollection), {
                ...oldBookingData,
                amount: parseFloat(newAmount),
                checkIn: Timestamp.fromDate(newCheckIn),
                checkOut: null,
                status: 'Active',
                createdAt: serverTimestamp()
            });
        });
        alert(`Stay for Room ${booking.roomNo} has been successfully extended.`);
    } catch (error) {
        console.error("Extension transaction failed: ", error);
        alert("Failed to extend stay. Please try again.");
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'Active');

  const BookingCard = ({ booking, index }) => {
    const cycleEndDate = getBookingCycleEnd(booking.checkIn);
    const isOverdue = cycleEndDate && new Date() > cycleEndDate;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        whileHover={{ y: -4 }}
      >
        <Card className={`h-full transition-all duration-300 hover:shadow-lg ${isOverdue ? 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{booking.roomNo}</span>
                </div>
                Room {booking.roomNo}
              </CardTitle>
              {isOverdue && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Overdue
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{booking.customerPhone}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-green-600">{formatCurrency(booking.amount)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(booking.checkIn?.toDate())}</span>
              </div>
              
              {cycleEndDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                    {formatDate(cycleEndDate)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t">
              {isOverdue ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAlreadyCheckout(booking.id, booking.roomId, cycleEndDate)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Already Left
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleExtendStay(booking, cycleEndDate)}
                    className="flex-1"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Extend Stay
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleCheckout(booking.id, booking.roomId)}
                  className="w-full"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Checkout
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
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
            <h1 className="text-3xl font-bold text-foreground">Active Bookings</h1>
            <p className="text-muted-foreground">Manage currently active guest bookings</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {activeBookings.length} Active Booking{activeBookings.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeBookings.length}</p>
                    <p className="text-sm text-muted-foreground">Active Bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {activeBookings.filter(b => {
                        const cycleEnd = getBookingCycleEnd(b.checkIn);
                        return cycleEnd && new Date() > cycleEnd;
                      }).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(activeBookings.reduce((sum, b) => sum + (b.amount || 0), 0))}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bookings Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {activeBookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Active Bookings</h3>
                  <p className="text-muted-foreground mb-4">
                    Great! All rooms are currently available. No active bookings at the moment.
                  </p>
                  <div className="text-6xl mb-4">🎉</div>
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {activeBookings.map((booking, index) => (
                  <BookingCard key={booking.id} booking={booking} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ActiveBookingsPage;