import React, { useEffect, useState, useMemo } from "react";
import { db } from "../config/firebase"; // Restored original firebase import
import { collection, onSnapshot } from "firebase/firestore";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Hotel as HotelIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { subDays, format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const KPICard = ({ title, value, icon, color, trend }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}1A 0%, ${color}05 100%)`,
          border: `1px solid ${color}30`,
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: theme.shadows[8],
            borderColor: color,
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: `${color}20`,
                color: color,
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
              }}
            >
              {icon}
            </Avatar>
            {trend && (
              <Chip
                icon={<TrendingUpIcon sx={{ fontSize: '1rem' }} />}
                label={trend}
                size="small"
                sx={{
                  bgcolor: `${theme.palette.success.main}20`,
                  color: theme.palette.success.main,
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '2.125rem' },
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
            }}
          >
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DashboardPage = () => {
  const theme = useTheme();
  const [allBookings, setAllBookings] = useState([]);
  const [dateRange, setDateRange] = useState([subDays(new Date(), 30), new Date()]);
  const [startDate, endDate] = dateRange;
  const [loading, setLoading] = useState(true);

  const TOTAL_AVAILABLE_ROOMS = 15;

  useEffect(() => {
    const bookingsCollection = collection(db, "bookings");
    const unsubscribe = onSnapshot(bookingsCollection, (snapshot) => {
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredBookings = useMemo(() => {
    if (!startDate || !endDate) return [];
    return allBookings.filter((booking) => {
      const checkInDate = booking.checkIn?.toDate();
      if (!checkInDate) return false;
      return isWithinInterval(checkInDate, {
        start: startOfDay(startDate),
        end: endOfDay(endDate),
      });
    });
  }, [allBookings, startDate, endDate]);

  const {
    totalRevenue,
    totalBookings,
    occupancyRate,
    averageDailyRate,
    revenueOverTime,
    bookingsByRoom,
    performanceByRoom,
  } = useMemo(() => {
    if (filteredBookings.length === 0 || !startDate || !endDate) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        occupancyRate: 0,
        averageDailyRate: 0,
        revenueOverTime: { labels: [], data: [] },
        bookingsByRoom: { labels: [], data: [] },
        performanceByRoom: [],
      };
    }

    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    const totalBookings = filteredBookings.length;
    const averageDailyRate = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    const daysInRange = (endOfDay(endDate).getTime() - startOfDay(startDate).getTime()) / (1000 * 3600 * 24) + 1;
    const totalRoomNightsAvailable = TOTAL_AVAILABLE_ROOMS * daysInRange;
    const occupancyRate = totalRoomNightsAvailable > 0 ? (totalBookings / totalRoomNightsAvailable) * 100 : 0;

    const revenueByDate = {};
    const bookingsByRoomData = {};
    const performanceByRoomData = {};

    filteredBookings.forEach((booking) => {
      if (!booking.checkIn || !booking.checkIn.toDate) return;
      const dateStr = format(booking.checkIn.toDate(), "yyyy-MM-dd");
      revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + booking.amount;

      const roomNo = booking.roomNo || "Unknown";
      bookingsByRoomData[roomNo] = (bookingsByRoomData[roomNo] || 0) + 1;
      if (!performanceByRoomData[roomNo]) {
        performanceByRoomData[roomNo] = { roomNo, totalBookings: 0, totalRevenue: 0 };
      }
      performanceByRoomData[roomNo].totalBookings += 1;
      performanceByRoomData[roomNo].totalRevenue += booking.amount;
    });

    const sortedRevenueDates = Object.keys(revenueByDate).sort();
    const revenueOverTime = {
      labels: sortedRevenueDates.map(date => format(new Date(date), 'MMM d')),
      data: sortedRevenueDates.map(date => revenueByDate[date]),
    };
    
    const sortedRooms = Object.keys(bookingsByRoomData).sort((a,b) => bookingsByRoomData[b] - bookingsByRoomData[a]);
    const bookingsByRoom = {
        labels: sortedRooms,
        data: sortedRooms.map(room => bookingsByRoomData[room]),
    };

    const performanceByRoom = Object.values(performanceByRoomData).sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      totalRevenue,
      totalBookings,
      occupancyRate,
      averageDailyRate,
      revenueOverTime,
      bookingsByRoom,
      performanceByRoom,
    };
  }, [filteredBookings, startDate, endDate]);

  const lineChartData = {
    labels: revenueOverTime.labels,
    datasets: [{
      label: "Revenue",
      data: revenueOverTime.data,
      borderColor: theme.palette.primary.main,
      backgroundColor: `${theme.palette.primary.main}20`,
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }],
  };
  
  const barChartData = {
    labels: bookingsByRoom.labels,
    datasets: [{
      label: "# of Bookings",
      data: bookingsByRoom.data,
      backgroundColor: theme.palette.secondary.main,
      borderRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: theme.palette.divider } },
    },
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
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          gap: 2,
        }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary, 
                mb: 0.5,
                fontSize: { xs: '1.75rem', sm: '2.25rem' },
              }}
            >
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Key performance metrics overview
            </Typography>
          </Box>
          <Paper
            sx={{
              p: 1,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              width: { xs: '100%', md: 'auto' },
              '& .react-datepicker-wrapper': { width: '100%' },
              '& .react-datepicker__input-container input': {
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: theme.palette.text.primary,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                textAlign: { xs: 'center', md: 'left' },
                padding: '8px',
              },
            }}
          >
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable={true}
              dateFormat="MMM d, yyyy"
              placeholderText="Select date range"
            />
          </Paper>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={6} md={3}>
          <KPICard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={<MoneyIcon />}
            color={theme.palette.success.main}
            trend="+12%"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            title="Total Bookings"
            value={totalBookings}
            icon={<HotelIcon />}
            color={theme.palette.primary.main}
            trend="+8%"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            title="Occupancy Rate"
            value={`${occupancyRate.toFixed(1)}%`}
            icon={<AssessmentIcon />}
            color={theme.palette.warning.main}
            trend="+5%"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            title="Avg. Daily Rate"
            value={`₹${averageDailyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<TrendingUpIcon />}
            color={theme.palette.secondary.main}
            trend="+15%"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={{ xs: 3, md: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12} lg={7}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, height: { xs: 300, md: 400 }, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Revenue Trend</Typography>
              <Box sx={{ height: { xs: 220, md: 320 } }}>
                <Line data={lineChartData} options={chartOptions} />
              </Box>
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} lg={5}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, height: { xs: 300, md: 400 }, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Bookings by Room</Typography>
              <Box sx={{ height: { xs: 220, md: 320 } }}>
                <Bar data={barChartData} options={chartOptions} />
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Performance Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Room Performance</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Room No.</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Bookings</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Performance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performanceByRoom.length > 0 ? (
                  performanceByRoom.map((room, index) => (
                    <TableRow key={room.roomNo} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>Room {room.roomNo}</Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {room.totalBookings}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} color="success.main">
                          ₹{room.totalRevenue.toLocaleString()}
                        </Typography>
                         {/* Show bookings count on mobile under revenue */}
                        <Typography variant="caption" sx={{ display: { xs: 'block', sm: 'none' }, color: 'text.secondary' }}>
                          {room.totalBookings} bookings
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((room.totalRevenue / Math.max(...performanceByRoom.map(r => r.totalRevenue))) * 100, 100)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No data for the selected period</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </motion.div>
    </Container>
  );
};

// The App wrapper is for standalone testing. You can integrate DashboardPage directly into your app's routing.
export default function App() {
    const theme = createTheme({
        palette: {
          primary: { main: '#1976d2' },
          secondary: { main: '#dc004e' },
          success: { main: '#2e7d32' },
          warning: { main: '#ed6c02' },
        },
        typography: {
          fontFamily: 'Roboto, sans-serif',
        },
        shape: {
          borderRadius: 12,
        },
      });

    return (
        <ThemeProvider theme={theme}>
            <DashboardPage />
        </ThemeProvider>
    )
}
