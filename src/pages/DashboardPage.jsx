import React, { useEffect, useState, useMemo } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  DollarSign,
  Hotel,
  Clock,
  BarChart3,
  PieChart
} from "lucide-react";

// Date utilities
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subDays, format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

// Chart components
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { formatCurrency, formatDateShort } from "../lib/utils";

// Configuration
const TOTAL_AVAILABLE_ROOMS = 15;
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const DashboardPage = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [dateRange, setDateRange] = useState([subDays(new Date(), 30), new Date()]);
  const [startDate, endDate] = dateRange;
  const [loading, setLoading] = useState(true);

  // Fetch all bookings from Firestore
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

  // Filter bookings based on date range
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

  // Calculate KPIs and chart data
  const dashboardData = useMemo(() => {
    if (filteredBookings.length === 0) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        occupancyRate: 0,
        averageDailyRate: 0,
        activeBookings: 0,
        revenueOverTime: [],
        bookingsByRoom: [],
        statusDistribution: [],
        topPerformingRooms: [],
      };
    }

    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    const totalBookings = filteredBookings.length;
    const activeBookings = allBookings.filter(b => b.status === 'Active').length;
    const averageDailyRate = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Occupancy Rate Calculation
    const daysInRange = (endOfDay(endDate).getTime() - startOfDay(startDate).getTime()) / (1000 * 3600 * 24) + 1;
    const totalRoomNightsAvailable = TOTAL_AVAILABLE_ROOMS * daysInRange;
    const occupancyRate = totalRoomNightsAvailable > 0 ? (totalBookings / totalRoomNightsAvailable) * 100 : 0;

    // Revenue over time
    const revenueByDate = {};
    const bookingsByRoomData = {};
    const statusCount = {};
    const performanceByRoomData = {};

    filteredBookings.forEach((booking) => {
      const dateStr = format(booking.checkIn.toDate(), "yyyy-MM-dd");
      revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + booking.amount;

      const roomNo = booking.roomNo || "Unknown";
      bookingsByRoomData[roomNo] = (bookingsByRoomData[roomNo] || 0) + 1;

      const status = booking.status || "Unknown";
      statusCount[status] = (statusCount[status] || 0) + 1;

      if (!performanceByRoomData[roomNo]) {
        performanceByRoomData[roomNo] = { roomNo, totalBookings: 0, totalRevenue: 0 };
      }
      performanceByRoomData[roomNo].totalBookings += 1;
      performanceByRoomData[roomNo].totalRevenue += booking.amount;
    });

    const revenueOverTime = Object.keys(revenueByDate)
      .sort()
      .map(date => ({
        date: formatDateShort(new Date(date)),
        revenue: revenueByDate[date],
      }));

    const bookingsByRoom = Object.entries(bookingsByRoomData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([room, count]) => ({ room, bookings: count }));

    const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
    }));

    const topPerformingRooms = Object.values(performanceByRoomData)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalBookings,
      occupancyRate,
      averageDailyRate,
      activeBookings,
      revenueOverTime,
      bookingsByRoom,
      statusDistribution,
      topPerformingRooms,
    };
  }, [filteredBookings, allBookings, startDate, endDate]);

  const KPICard = ({ title, value, icon: Icon, trend, description, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">{trend}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

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
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                isClearable={true}
                dateFormat="MMM d, yyyy"
                className="px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholderText="Select date range"
              />
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Revenue"
            value={formatCurrency(dashboardData.totalRevenue)}
            icon={DollarSign}
            description="Revenue in selected period"
            delay={0.1}
          />
          <KPICard
            title="Total Bookings"
            value={dashboardData.totalBookings}
            icon={Calendar}
            description="Bookings in selected period"
            delay={0.2}
          />
          <KPICard
            title="Active Bookings"
            value={dashboardData.activeBookings}
            icon={Clock}
            description="Currently active"
            delay={0.3}
          />
          <KPICard
            title="Occupancy Rate"
            value={`${dashboardData.occupancyRate.toFixed(1)}%`}
            icon={Hotel}
            description="Room utilization"
            delay={0.4}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Daily revenue over selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.revenueOverTime}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs fill-muted-foreground"
                      />
                      <YAxis className="text-xs fill-muted-foreground" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [formatCurrency(value), 'Revenue']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bookings by Room */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Top Performing Rooms
                </CardTitle>
                <CardDescription>Bookings by room number</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.bookingsByRoom}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="room" 
                        className="text-xs fill-muted-foreground"
                      />
                      <YAxis className="text-xs fill-muted-foreground" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [value, 'Bookings']}
                      />
                      <Bar 
                        dataKey="bookings" 
                        fill="hsl(var(--secondary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Booking Status
                </CardTitle>
                <CardDescription>Distribution of booking statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.statusDistribution.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <Badge variant="secondary">{item.value}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Performing Rooms Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Room Performance
                </CardTitle>
                <CardDescription>Top performing rooms by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.topPerformingRooms.map((room, index) => (
                    <div key={room.roomNo} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">Room {room.roomNo}</p>
                          <p className="text-sm text-muted-foreground">{room.totalBookings} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(room.totalRevenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(room.totalRevenue / room.totalBookings)} avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;