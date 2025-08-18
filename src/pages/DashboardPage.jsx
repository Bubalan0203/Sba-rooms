import React, { useEffect, useState, useMemo } from "react";
import { db } from "../config/firebase";
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
    >
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}30`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[8],
            borderColor: color,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: `${color}20`,
                color: color,
                width: 56,
                height: 56,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
    if (filteredBookings.length === 0) {
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
      borderWidth: 3,
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
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: theme.palette.divider,
        },
      },
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
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
              Dashboard Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor your hotel's performance and key metrics
            </Typography>
          </Box>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              '& .react-datepicker-wrapper': {
                width: '100%',
              },
              '& .react-datepicker__input-container input': {
                border: 'none',
                outline: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: theme.palette.text.primary,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                minWidth: '200px',
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={<MoneyIcon />}
            color={theme.palette.success.main}
            trend="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            title="Total Bookings"
            value={totalBookings}
            icon={<HotelIcon />}
            color={theme.palette.primary.main}
            trend="+8%"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            title="Occupancy Rate"
            value={`${occupancyRate.toFixed(1)}%`}
            icon={<AssessmentIcon />}
            color={theme.palette.warning.main}
            trend="+5%"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper sx={{ p: 3, height: 400, borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
                Revenue Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={lineChartData} options={chartOptions} />
              </Box>
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper sx={{ p: 3, height: 400, borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
                Bookings by Room
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={barChartData} options={chartOptions} />
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Paper sx={{ borderRadius: 3, boxShadow: theme.shadows[2], overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              Room Performance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Detailed breakdown of bookings and revenue per room
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Room No.</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Bookings</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Performance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performanceByRoom.length > 0 ? (
                  performanceByRoom.map((room, index) => (
                    <TableRow
                      key={room.roomNo}
                      sx={{
                        '&:hover': { bgcolor: theme.palette.action.hover },
                        borderLeft: index === 0 ? `4px solid ${theme.palette.success.main}` : 'none',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, fontSize: '0.875rem' }}>
                            {room.roomNo}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Room {room.roomNo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={room.totalBookings}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.primary.light + '30',
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                        ₹{room.totalRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((room.totalRevenue / Math.max(...performanceByRoom.map(r => r.totalRevenue))) * 100, 100)}
                            sx={{
                              width: 60,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: theme.palette.grey[200],
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor: index === 0 ? theme.palette.success.main : theme.palette.primary.main,
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {Math.round((room.totalRevenue / Math.max(...performanceByRoom.map(r => r.totalRevenue))) * 100)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No performance data available for the selected period
                      </Typography>
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

export default DashboardPage;