import React, { useEffect, useState, useMemo } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Container, Row, Col, Spinner } from "react-bootstrap";
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
import {
  StyledContainer,
  PageHeader,
  KPICard,
  ChartContainer,
  TableContainer,
  StatsGrid,
  LoadingSpinner
} from "../components/StyledComponents";
import { FaChartLine, FaHotel, FaRupeeSign, FaTrendingUp } from "react-icons/fa";

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

const DashboardKPICard = ({ title, value, icon, trend, gradient }) => {
  return (
    <KPICard gradient={gradient}>
      <div className="kpi-icon">{icon}</div>
      <h3>{value}</h3>
      <div className="kpi-title">{title}</div>
      {trend && <div className="kpi-trend">{trend}</div>}
    </KPICard>
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
      <StyledContainer fluid>
        <LoadingSpinner>
          <Spinner animation="border" variant="primary" />
        </LoadingSpinner>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer fluid>
      <PageHeader>
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="mb-2">
                <FaChartLine className="me-3" />
                Dashboard
              </h1>
              <p className="mb-0">
                Key performance metrics for {MONTHS[selectedMonth]} {selectedYear}
              </p>
            </Col>
            <Col lg={4} className="mt-3 mt-lg-0">
              <Row className="g-2">
                <Col xs={6}>
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
                </Col>
                <Col xs={6}>
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
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </PageHeader>

      {/* KPI Cards */}
      <StatsGrid>
        <DashboardKPICard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<FaRupeeSign />}
          trend="+12%"
          gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
        />
        <DashboardKPICard
          title="Total Bookings"
          value={totalBookings}
          icon={<FaHotel />}
          trend="+8%"
          gradient="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
        />
        <DashboardKPICard
          title="Avg. Daily Rate"
          value={`₹${averageDailyRate.toFixed(2)}`}
          icon={<FaTrendingUp />}
          trend="+15%"
          gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
        />
        <DashboardKPICard
          title="Occupancy Rate"
          value="85%"
          icon={<FaChartLine />}
          trend="+5%"
          gradient="linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
        />
      </StatsGrid>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={8} className="mb-4">
          <ChartContainer>
            <h5>Revenue Trend</h5>
            <div style={{ height: '300px', position: 'relative' }}>
              <Line 
                data={lineChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: '#f1f5f9'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          </ChartContainer>
        </Col>
        <Col lg={4} className="mb-4">
          <ChartContainer>
            <h5>Bookings by Room</h5>
            <div style={{ height: '300px', position: 'relative' }}>
              <Bar 
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: '#f1f5f9'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          </ChartContainer>
        </Col>
      </Row>

      {/* Room Performance Table */}
      <TableContainer>
        <div className="p-4">
          <h5 className="mb-4">Room Performance</h5>
          <div className="table-responsive">
            <table className="table">
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
                      <td>
                        <strong>Room {room.roomNo}</strong>
                      </td>
                      <td>
                        <span className="badge bg-primary">{room.totalBookings}</span>
                      </td>
                      <td>
                        <strong className="text-success">₹{room.totalRevenue.toLocaleString()}</strong>
                      </td>
                      <td>₹{room.averageDailyRate.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      <div>
                        <FaChartLine size={48} className="mb-3 opacity-50" />
                        <h6>No data for selected period</h6>
                        <p>Try selecting a different month or year</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </TableContainer>
    </StyledContainer>
  );
};

export default DashboardPage;
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