import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { 
  Bed, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeRooms = onSnapshot(collection(db, 'rooms'), (snapshot) => {
      setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubscribeRooms();
      unsubscribeBookings();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(room => room.status === 'Available').length;
  const bookedRooms = rooms.filter(room => room.status === 'Booked').length;
  const activeBookings = bookings.filter(booking => booking.status === 'Booked').length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
  const todayBookings = bookings.filter(booking => {
    const bookingDate = booking.bookingTime?.toDate?.();
    const today = new Date();
    return bookingDate && 
           bookingDate.toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      title: 'Total Rooms',
      value: totalRooms,
      icon: Bed,
      color: 'bg-blue-500',
      change: '+0%'
    },
    {
      title: 'Available Rooms',
      value: availableRooms,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: `${Math.round((availableRooms / totalRooms) * 100)}%`
    },
    {
      title: 'Booked Rooms',
      value: bookedRooms,
      icon: AlertCircle,
      color: 'bg-orange-500',
      change: `${Math.round((bookedRooms / totalRooms) * 100)}%`
    },
    {
      title: 'Active Bookings',
      value: activeBookings,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+12%'
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      change: '+8%'
    },
    {
      title: 'Today\'s Bookings',
      value: todayBookings,
      icon: Clock,
      color: 'bg-indigo-500',
      change: '+5%'
    }
  ];

  const recentBookings = bookings
    .sort((a, b) => {
      const aTime = a.bookingTime?.toDate?.() || new Date(0);
      const bTime = b.bookingTime?.toDate?.() || new Date(0);
      return bTime - aTime;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <img 
            src="/Gemini_Generated_Image_rh722brh722brh72.png" 
            alt="SBA Rooms Logo" 
            className="w-16 h-16 rounded-xl bg-white/20 p-2"
          />
          <div>
            <h1 className="text-2xl font-bold">Welcome to SBA Rooms</h1>
            <p className="text-blue-100">Manage your hotel operations efficiently</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.title}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  vs last month
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Bookings
          </h3>
          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent bookings
              </p>
            ) : (
              recentBookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Room {booking.roomNo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{booking.totalAmount}
                    </p>
                    <p className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'Booked' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {booking.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Room Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Room Status Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Available</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {availableRooms} rooms
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Booked</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {bookedRooms} rooms
              </span>
            </div>
            
            {/* Occupancy Rate */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {Math.round((bookedRooms / totalRooms) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(bookedRooms / totalRooms) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;