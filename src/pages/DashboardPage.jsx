import React, { useEffect, useState, useMemo } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";

// --- Library Imports ---
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

// --- Register Chart.js components ---
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

// --- Reusable KPICard Component ---
const KPICard = ({ title, value, icon }) => (
  <div style={styles.kpiCard}>
    <div style={styles.kpiIcon}>{icon}</div>
    <div>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiTitle}>{title}</div>
    </div>
  </div>
);

// --- Main Dashboard Component ---
const DashboardPage = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [dateRange, setDateRange] = useState([subDays(new Date(), 30), new Date()]);
  const [startDate, endDate] = dateRange;

  // This is a configuration value. You should update this to your total number of rooms.
  const TOTAL_AVAILABLE_ROOMS = 15;

  // 1. Fetch all bookings from Firestore on component mount
  useEffect(() => {
    const bookingsCollection = collection(db, "bookings");
    const unsubscribe = onSnapshot(bookingsCollection, (snapshot) => {
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllBookings(bookingsData);
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // 2. Filter bookings based on the selected date range
  const filteredBookings = useMemo(() => {
    if (!startDate || !endDate) return [];
    return allBookings.filter((booking) => {
      const checkInDate = booking.checkIn?.toDate();
      if (!checkInDate) return false;
      // Compare dates within the selected interval
      return isWithinInterval(checkInDate, {
        start: startOfDay(startDate),
        end: endOfDay(endDate),
      });
    });
  }, [allBookings, startDate, endDate]);

  // 3. Calculate all KPIs using the filtered data
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

    // KPI Calculations
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    const totalBookings = filteredBookings.length;
    const averageDailyRate = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Occupancy Rate Calculation (Simplified)
    // Number of days in the selected range
    const daysInRange = (endOfDay(endDate).getTime() - startOfDay(startDate).getTime()) / (1000 * 3600 * 24) + 1;
    const totalRoomNightsAvailable = TOTAL_AVAILABLE_ROOMS * daysInRange;
    const occupancyRate = totalRoomNightsAvailable > 0 ? (totalBookings / totalRoomNightsAvailable) * 100 : 0;

    // Data processing for charts and tables
    const revenueByDate = {};
    const bookingsByRoomData = {};
    const performanceByRoomData = {};

    filteredBookings.forEach((booking) => {
      // For Revenue Line Chart
      const dateStr = format(booking.checkIn.toDate(), "yyyy-MM-dd");
      revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + booking.amount;

      // For Bookings Bar Chart & Performance Table
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

  // --- Chart Data & Options ---
  const lineChartData = {
    labels: revenueOverTime.labels,
    datasets: [{
      label: "Revenue",
      data: revenueOverTime.data,
      borderColor: "rgb(75, 192, 192)",
      backgroundColor: "rgba(75, 192, 192, 0.5)",
    }],
  };
  
  const barChartData = {
    labels: bookingsByRoom.labels,
    datasets: [{
      label: "# of Bookings",
      data: bookingsByRoom.data,
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    }],
  };

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.header}>
        <h2>SBA Rooms Dashboard</h2>
        <div style={styles.datePickerContainer}>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable={true}
            dateFormat="MMM d, yyyy"
          />
        </div>
      </div>

      {/* KPI Cards Section */}
      <div style={styles.kpiGrid}>
        <KPICard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon="💵" />
        <KPICard title="Total Bookings" value={totalBookings} icon="🏨" />
        <KPICard title="Occupancy Rate" value={`${occupancyRate.toFixed(1)}%`} icon="📈" />
        <KPICard title="Avg. Daily Rate (ADR)" value={`₹${averageDailyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon="💰" />
      </div>

      {/* Charts Section */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartContainer}>
            <h3>Revenue Trend</h3>
            <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div style={styles.chartContainer}>
            <h3>Bookings by Room</h3>
            <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Detailed Table Section */}
       <div style={styles.tableContainer}>
        <h3>Performance Per Room</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Room No.</th>
              <th style={styles.th}># of Bookings</th>
              <th style={styles.th}>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {performanceByRoom.map(room => (
               <tr key={room.roomNo}>
                 <td style={styles.td}>{room.roomNo}</td>
                 <td style={styles.td}>{room.totalBookings}</td>
                 <td style={styles.td}>₹{room.totalRevenue.toLocaleString()}</td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Styles ---
const styles = {
    dashboardContainer: { fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f4f7f6' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    datePickerContainer: { zIndex: 10 },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' },
    kpiCard: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    kpiIcon: { fontSize: '2.5rem', marginRight: '20px' },
    kpiValue: { fontSize: '1.8rem', fontWeight: 'bold' },
    kpiTitle: { fontSize: '0.9rem', color: '#666' },
    chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' },
    chartContainer: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: '400px' },
    tableContainer: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { borderBottom: '2px solid #ddd', padding: '12px', textAlign: 'left', backgroundColor: '#f9f9f9' },
    td: { borderBottom: '1px solid #ddd', padding: '12px', textAlign: 'left' },
};

export default DashboardPage;