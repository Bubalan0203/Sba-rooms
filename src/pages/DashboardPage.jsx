import React, { useEffect, useState, useMemo } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
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
import { format } from "date-fns";

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

const KPICard = ({ title, value, icon, trend }) => {
  return (
    <div className="card text-center">
      <div className="card-body">
        <div className="mb-2">{icon}</div>
        <h3>{value}</h3>
        <p>{title}</p>
        {trend && <span className="badge bg-success">{trend}</span>}
      </div>
    </div>
  );
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const DashboardPage = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
    return allBookings.filter((booking) => {
      const checkInDate = booking.checkIn?.toDate();
      if (!checkInDate) return false;
      return (
        checkInDate.getFullYear() === selectedYear &&
        checkInDate.getMonth() === selectedMonth
      );
    });
  }, [allBookings, selectedMonth, selectedYear]);

  const {
    totalRevenue,
    totalBookings,
    averageDailyRate,
    revenueOverTime,
    bookingsByRoom,
    performanceByRoom,
  } = useMemo(() => {
    if (filteredBookings.length === 0) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        averageDailyRate: 0,
        revenueOverTime: { labels: [], data: [] },
        bookingsByRoom: { labels: [], data: [] },
        performanceByRoom: [],
      };
    }

    const totalRevenue = filteredBookings.reduce(
      (sum, booking) => sum + (booking.amount || 0),
      0
    );
    const totalBookings = filteredBookings.length;
    const averageDailyRate =
      totalBookings > 0 ? totalRevenue / totalBookings : 0;

    const revenueByDate = {};
    const bookingsByRoomData = {};
    const performanceByRoomData = {};

    filteredBookings.forEach((booking) => {
      if (!booking.checkIn || !booking.checkIn.toDate) return;
      const dateStr = format(booking.checkIn.toDate(), "yyyy-MM-dd");
      revenueByDate[dateStr] =
        (revenueByDate[dateStr] || 0) + booking.amount;

      const roomNo = booking.roomNo || "Unknown";
      bookingsByRoomData[roomNo] = (bookingsByRoomData[roomNo] || 0) + 1;
      if (!performanceByRoomData[roomNo]) {
        performanceByRoomData[roomNo] = {
          roomNo,
          totalBookings: 0,
          totalRevenue: 0,
        };
      }
      performanceByRoomData[roomNo].totalBookings += 1;
      performanceByRoomData[roomNo].totalRevenue += booking.amount;
    });

    const sortedRevenueDates = Object.keys(revenueByDate).sort();
    const revenueOverTime = {
      labels: sortedRevenueDates.map((date) =>
        format(new Date(date), "MMM d")
      ),
      data: sortedRevenueDates.map((date) => revenueByDate[date]),
    };

    const sortedRooms = Object.keys(bookingsByRoomData).sort(
      (a, b) => bookingsByRoomData[b] - bookingsByRoomData[a]
    );
    const bookingsByRoom = {
      labels: sortedRooms,
      data: sortedRooms.map((room) => bookingsByRoomData[room]),
    };

    const performanceByRoom = Object.values(performanceByRoomData).map(
      (room) => ({
        ...room,
        averageDailyRate:
          room.totalBookings > 0
            ? room.totalRevenue / room.totalBookings
            : 0,
      })
    );

    return {
      totalRevenue,
      totalBookings,
      averageDailyRate,
      revenueOverTime,
      bookingsByRoom,
      performanceByRoom,
    };
  }, [filteredBookings]);

  const lineChartData = {
    labels: revenueOverTime.labels,
    datasets: [
      {
        label: "Revenue",
        data: revenueOverTime.data,
        borderColor: "blue",
        backgroundColor: "rgba(0,0,255,0.2)",
      },
    ],
  };

  const barChartData = {
    labels: bookingsByRoom.labels,
    datasets: [
      {
        label: "# of Bookings",
        data: bookingsByRoom.data,
        backgroundColor: "orange",
      },
    ],
  };

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>Dashboard</h2>
          <p>
            Key performance metrics for {MONTHS[selectedMonth]} {selectedYear}
          </p>
        </div>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <KPICard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon="💰"
            trend="+12%"
          />
        </div>
        <div className="col-md-4">
          <KPICard
            title="Total Bookings"
            value={totalBookings}
            icon="🏨"
            trend="+8%"
          />
        </div>
        <div className="col-md-4">
          <KPICard
            title="Avg. Daily Rate"
            value={`₹${averageDailyRate.toFixed(2)}`}
            icon="📈"
            trend="+15%"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-lg-7 mb-3">
          <div className="card">
            <div className="card-body">
              <h5>Revenue Trend</h5>
              <Line data={lineChartData} />
            </div>
          </div>
        </div>
        <div className="col-lg-5 mb-3">
          <div className="card">
            <div className="card-body">
              <h5>Bookings by Room</h5>
              <Bar data={barChartData} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body">
          <h5>Room Performance</h5>
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>Room No.</th>
                <th>Bookings</th>
                <th>Revenue</th>
                <th>Avg. Daily Rate</th>
              </tr>
            </thead>
            <tbody>
              {performanceByRoom.length > 0 ? (
                performanceByRoom.map((room) => (
                  <tr key={room.roomNo}>
                    <td>Room {room.roomNo}</td>
                    <td>{room.totalBookings}</td>
                    <td>₹{room.totalRevenue.toLocaleString()}</td>
                    <td>₹{room.averageDailyRate.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No data for selected period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;