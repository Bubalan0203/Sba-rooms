import React, { useEffect, useState, useMemo } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import styled from "styled-components";
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
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { format } from "date-fns";
import {
  FaTachometerAlt,
  FaRupeeSign,
  FaHotel,
  FaChartLine,
  FaCalendarAlt,
  FaUsers,
  FaBed
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardContainer = styled.div`
  padding: 2rem;
  background: #f1f5f9;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: white;
  padding: 3rem 2rem;
  margin: -2rem -2rem 2rem -2rem;
  border-radius: 0 0 24px 24px;
  
  @media (max-width: 768px) {
    margin: -1rem -1rem 2rem -1rem;
    padding: 2rem 1rem;
  }
  
  h1 {
    color: white;
    margin-bottom: 0.5rem;
    font-weight: 800;
    font-size: clamp(2rem, 5vw, 3rem);
  }
  
  p {
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0;
    font-size: 1.2rem;
  }
`;

const StyledCard = styled(Card)`
  border: none;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
`;

const KPICard = styled(StyledCard)`
  text-align: center;
  background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  
  .card-body {
    padding: 2rem 1rem;
  }
  
  .kpi-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.9;
  }
  
  .kpi-value {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: white;
  }
  
  .kpi-title {
    font-size: 1rem;
    font-weight: 600;
    opacity: 0.95;
    margin-bottom: 0.5rem;
  }
  
  .kpi-trend {
    font-size: 0.875rem;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  
  .form-select {
    border-radius: 12px;
    border: 1px solid #d1d5db;
    padding: 0.75rem 1rem;
    
    &:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }
`;

const ChartCard = styled(StyledCard)`
  .card-body {
    padding: 2rem;
  }
  
  .chart-title {
    color: #1e293b;
    font-weight: 700;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  
  .spinner-border {
    width: 3rem;
    height: 3rem;
    border-width: 0.3em;
  }
`;

const KPICardComponent = ({ title, value, icon, trend, gradient }) => {
  return (
    <KPICard gradient={gradient}>
      <div className="card-body">
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-title">{title}</div>
        {trend && (
          <div className="kpi-trend">
            <FaUsers size={12} />
            {trend}
          </div>
        )}
      </div>
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
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const bookingsCollection = collection(db, "bookings");
    const roomsCollection = collection(db, "rooms");
    
    const unsubscribeBookings = onSnapshot(bookingsCollection, (snapshot) => {
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllBookings(bookingsData);
    });
    
    const unsubscribeRooms = onSnapshot(roomsCollection, (snapshot) => {
      const roomsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllRooms(roomsData);
      setLoading(false);
    });
    
    return () => {
      unsubscribeBookings();
      unsubscribeRooms();
    };
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
    occupancyRate,
    revenueOverTime,
    bookingsByRoom,
    statusDistribution,
    performanceByRoom,
  } = useMemo(() => {
    if (filteredBookings.length === 0) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        averageDailyRate: 0,
        occupancyRate: 0,
        revenueOverTime: { labels: [], data: [] },
        bookingsByRoom: { labels: [], data: [] },
        statusDistribution: { labels: [], data: [] },
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
    
    const occupiedRooms = new Set(filteredBookings.map(b => b.roomId)).size;
    const occupancyRate = allRooms.length > 0 ? (occupiedRooms / allRooms.length) * 100 : 0;

    const revenueByDate = {};
    const bookingsByRoomData = {};
    const performanceByRoomData = {};
    const statusCount = {};

    filteredBookings.forEach((booking) => {
      if (!booking.checkIn || !booking.checkIn.toDate) return;
      const dateStr = format(booking.checkIn.toDate(), "yyyy-MM-dd");
      revenueByDate[dateStr] =
        (revenueByDate[dateStr] || 0) + booking.amount;

      const roomNo = booking.roomNo || "Unknown";
      bookingsByRoomData[roomNo] = (bookingsByRoomData[roomNo] || 0) + 1;
      
      statusCount[booking.status] = (statusCount[booking.status] || 0) + 1;
      
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
    
    const statusDistribution = {
      labels: Object.keys(statusCount),
      data: Object.values(statusCount),
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
      occupancyRate,
      revenueOverTime,
      bookingsByRoom,
      statusDistribution,
      performanceByRoom,
    };
  }, [filteredBookings, allRooms]);

  const lineChartData = {
    labels: revenueOverTime.labels,
    datasets: [
      {
        label: "Revenue",
        data: revenueOverTime.data,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const barChartData = {
    labels: bookingsByRoom.labels,
    datasets: [
      {
        label: "# of Bookings",
        data: bookingsByRoom.data,
        backgroundColor: "#f59e0b",
        borderRadius: 8,
      },
    ],
  };
  
  const doughnutData = {
    labels: statusDistribution.labels,
    datasets: [
      {
        data: statusDistribution.data,
        backgroundColor: [
          "#10b981",
          "#3b82f6",
          "#f59e0b",
          "#ef4444",
        ],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner>
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </LoadingSpinner>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <PageHeader>
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="mb-2">
                <FaTachometerAlt className="me-3" />
                Dashboard
              </h1>
              <p className="mb-0">
                Statistics for {MONTHS[selectedMonth]} {selectedYear}
              </p>
            </Col>
            <Col lg={4} className="mt-3 mt-lg-0">
              <div className="d-flex gap-2 justify-content-lg-end">
                <select
                  className="form-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i} style={{ color: '#000' }}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  className="form-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y} style={{ color: '#000' }}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </Col>
          </Row>
        </Container>
      </PageHeader>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <KPICardComponent
              title="Total Revenue"
              value={`₹${totalRevenue.toLocaleString()}`}
              icon={<FaRupeeSign />}
              trend="+12%"
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            />
          </motion.div>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <KPICardComponent
              title="Total Bookings"
              value={totalBookings}
              icon={<FaHotel />}
              trend="+8%"
              gradient="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
            />
          </motion.div>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <KPICardComponent
              title="Avg. Daily Rate"
              value={`₹${averageDailyRate.toFixed(0)}`}
              icon={<FaChartLine />}
              trend="+15%"
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            />
          </motion.div>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <KPICardComponent
              title="Occupancy Rate"
              value={`${occupancyRate.toFixed(1)}%`}
              icon={<FaBed />}
              trend="+5%"
              gradient="linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
            />
          </motion.div>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={8} className="mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <ChartCard>
              <div className="card-body">
                <h5 className="chart-title">
                  <FaChartLine />
                  Revenue Trend
                </h5>
                <Line 
                  data={lineChartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0,0,0,0.1)',
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </div>
            </ChartCard>
          </motion.div>
        </Col>
        <Col lg={4} className="mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <ChartCard>
              <div className="card-body">
                <h5 className="chart-title">
                  <FaUsers />
                  Booking Status
                </h5>
                {statusDistribution.labels.length > 0 ? (
                  <Doughnut 
                    data={doughnutData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="text-center text-muted py-4">
                    <p>No data available</p>
                  </div>
                )}
              </div>
            </ChartCard>
          </motion.div>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <ChartCard>
              <div className="card-body">
                <h5 className="chart-title">
                  <FaBed />
                  Bookings by Room
                </h5>
                {bookingsByRoom.labels.length > 0 ? (
                  <Bar 
                    data={barChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0,0,0,0.1)',
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="text-center text-muted py-4">
                    <p>No bookings data available</p>
                  </div>
                )}
              </div>
            </ChartCard>
          </motion.div>
        </Col>
        <Col lg={6} className="mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <ChartCard>
              <div className="card-body">
                <h5 className="chart-title">
                  <FaCalendarAlt />
                  Room Performance
                </h5>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Room</th>
                        <th>Bookings</th>
                        <th>Revenue</th>
                        <th>Avg. Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceByRoom.length > 0 ? (
                        performanceByRoom.slice(0, 5).map((room) => (
                          <tr key={room.roomNo}>
                            <td>
                              <strong>Room {room.roomNo}</strong>
                            </td>
                            <td>
                              <span className="badge bg-primary">
                                {room.totalBookings}
                              </span>
                            </td>
                            <td>
                              <span className="text-success fw-bold">
                                ₹{room.totalRevenue.toLocaleString()}
                              </span>
                            </td>
                            <td>₹{room.averageDailyRate.toFixed(0)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            No performance data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </ChartCard>
          </motion.div>
        </Col>
      </Row>
    </DashboardContainer>
  );
};

export default DashboardPage;
           