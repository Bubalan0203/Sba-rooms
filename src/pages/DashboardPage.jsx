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
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
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
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: { xs: 2, sm: 3, md: 4 }, 
        px: { xs: 2, sm: 3, md: 4 },
        ml: { xs: 0, md: isMobile ? 0 : '280px' },
        width: { xs: '100%', md: isMobile ? '100%' : 'calc(100% - 280px)' },
        maxWidth: 'none',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
        }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                color: theme.palette.text.primary, 
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              }}
            >
              Dashboard Overview
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              Monitor your hotel's performance and key metrics
            </Typography>
          </Box>
          <Paper
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              border: `1px solid rgba(0, 0, 0, 0.08)`,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              minWidth: { xs: '100%', sm: 'auto' },
              '& .react-datepicker-wrapper': {
                width: '100%',
              },
              '& .react-datepicker__input-container input': {
                border: 'none',
                outline: 'none',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                fontWeight: 600,
                color: theme.palette.text.primary,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                minWidth: { xs: '180px', sm: '200px' },
                textAlign: { xs: 'center', sm: 'left' },
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
        <Grid item xs={6} sm={6} lg={3}>
          <KPICard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={<MoneyIcon />}
            color={theme.palette.success.main}
            trend="+12%"
          />
        </Grid>
        <Grid item xs={6} sm={6} lg={3}>
          <KPICard
            title="Total Bookings"
            value={totalBookings}
            icon={<HotelIcon />}
            color={theme.palette.primary.main}
            trend="+8%"
          />
        </Grid>
        <Grid item xs={6} sm={6} lg={3}>
          <KPICard
            title="Occupancy Rate"
            value={`${occupancyRate.toFixed(1)}%`}
            icon={<AssessmentIcon />}
            color={theme.palette.warning.main}
            trend="+5%"
          />
        </Grid>
        <Grid item xs={6} sm={6} lg={3}>
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
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12} lg={isTablet ? 12 : 8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper sx={{ 
              p: { xs: 2, sm: 3 }, 
              height: { xs: 300, sm: 350, md: 400 }, 
              borderRadius: 4, 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: { xs: 2, sm: 3 }, 
                  color: theme.palette.text.primary,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                }}
              >
                Revenue Trend
              </Typography>
              <Box sx={{ height: { xs: 220, sm: 270, md: 300 } }}>
                <Line data={lineChartData} options={chartOptions} />
              </Box>
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} lg={isTablet ? 12 : 4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper sx={{ 
              p: { xs: 2, sm: 3 }, 
              height: { xs: 300, sm: 350, md: 400 }, 
              borderRadius: 4, 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: { xs: 2, sm: 3 }, 
                  color: theme.palette.text.primary,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                }}
              >
                Bookings by Room
              </Typography>
              <Box sx={{ height: { xs: 220, sm: 270, md: 300 } }}>
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
        <Paper sx={{ 
          borderRadius: 4, 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          overflow: 'hidden',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}>
          <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderBottom: `1px solid rgba(0, 0, 0, 0.08)`,
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                mb: 0.5,
              }}
            >
              Room Performance
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Detailed breakdown of bookings and revenue per room
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: { xs: 400, sm: 500 } }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(248, 250, 252, 0.8)' }}>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    py: { xs: 1.5, sm: 2 },
                  }}>
                    Room No.
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    display: { xs: 'none', sm: 'table-cell' },
                  }}>
                    Bookings
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  }}>
                    Revenue
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    display: { xs: 'none', md: 'table-cell' },
                  }}>
                    Performance
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performanceByRoom.length > 0 ? (
                  performanceByRoom.map((room, index) => (
                    <TableRow
                      key={room.roomNo}
                      sx={{
                        '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.04)' },
                        borderLeft: index === 0 ? `4px solid ${theme.palette.success.main}` : '4px solid transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <TableCell sx={{ py: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ 
                            width: { xs: 28, sm: 32 }, 
                            height: { xs: 28, sm: 32 }, 
                            bgcolor: theme.palette.primary.main, 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            fontWeight: 700,
                          }}>
                            {room.roomNo}
                          </Avatar>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            }}
                          >
                            Room {room.roomNo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Chip
                          label={room.totalBookings}
                          size="small"
                          sx={{
                            bgcolor: `${theme.palette.primary.main}20`,
                            color: theme.palette.primary.main,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        color: theme.palette.success.main,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      }}>
                        ₹{room.totalRevenue.toLocaleString()}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: { xs: 'block', sm: 'none' },
                            color: theme.palette.text.secondary,
                            fontSize: '0.7rem',
                          }}
                        >
                          {room.totalBookings} bookings
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((room.totalRevenue / Math.max(...performanceByRoom.map(r => r.totalRevenue))) * 100, 100)}
                            sx={{
                              width: { sm: 60, md: 80 },
                              height: 8,
                              borderRadius: 4,
                              bgcolor: theme.palette.grey[200],
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                bgcolor: index === 0 ? theme.palette.success.main : theme.palette.primary.main,
                              },
                            }}
                          />
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                          >
                            {Math.round((room.totalRevenue / Math.max(...performanceByRoom.map(r => r.totalRevenue))) * 100)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                      >
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