import React, { useState, useEffect, useMemo } from "react";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { Bed, Plus, Edit, Trash2, AirVent, Wind } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomNo, setRoomNo] = useState("");
  const [roomType, setRoomType] = useState("AC");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, room: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roomsCollection = useMemo(() => collection(db, "rooms"), []); // This is your Firestore collection

  // Fetch rooms in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(roomsCollection, (snapshot) => {
      const roomsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomsData);
      setLoading(false);
    });
    return unsubscribe;
  }, [roomsCollection]);

  // Add or update room
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomNo.trim()) {
      alert("Room number is required!");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editId) {
        // Update existing room
        const roomRef = doc(db, "rooms", editId);
        await updateDoc(roomRef, {
          roomNo,
          roomType,
          updatedAt: serverTimestamp()
        });
        setEditId(null);
      } else {
        // Add new room with default status = "Available"
        await addDoc(roomsCollection, {
          roomNo,
          roomType,
          status: "Available", // 👈 default field
          createdAt: serverTimestamp()
        });
      }

      setRoomNo("");
      setRoomType("AC");
      setShowForm(false);
    } catch (error) {
      console.error("Error saving room:", error);
      alert("Error saving room. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit room
  const handleEdit = (room) => {
    setEditId(room.id);
    setRoomNo(room.roomNo);
    setRoomType(room.roomType);
    setShowForm(true);
  };

  // Delete room
  const handleDelete = async () => {
    if (!deleteModal.room) return;
    
    try {
      await deleteDoc(doc(db, "rooms", deleteModal.room.id));
      setDeleteModal({ show: false, room: null });
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Error deleting room. Please try again.");
    }
  };

  const getRoomTypeIcon = (type) => {
    switch (type) {
      case 'AC':
        return <AirVent className="w-5 h-5" />;
      case 'Non-AC':
        return <Wind className="w-5 h-5" />;
      default:
        return <Bed className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    return status === 'Available' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading rooms..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rooms Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your hotel rooms and their availability</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Room</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Bed className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{rooms.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Bed className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rooms.filter(r => r.status === 'Available').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Bed className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Booked</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rooms.filter(r => r.status === 'Booked').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <div 
            key={room.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  {getRoomTypeIcon(room.roomType)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Room {room.roomNo}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {room.roomType}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(room.status)}`}>
                {room.status}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(room)}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteModal({ show: true, room })}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <Bed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rooms yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first room</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Room
          </button>
        </div>
      )}

      {/* Add/Edit Room Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditId(null);
          setRoomNo("");
          setRoomType("AC");
        }}
        title={editId ? "Edit Room" : "Add New Room"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Number
            </label>
            <input
              type="text"
              placeholder="Enter room number"
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Type
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isSubmitting}
            >
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
              <option value="Both">Both</option>
            </select>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
                setRoomNo("");
                setRoomType("AC");
              }}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting && <LoadingSpinner size="sm" />}
              <span>{editId ? "Update Room" : "Add Room"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, room: null })}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete Room ${deleteModal.room?.roomNo}? This action cannot be undone.`}
        confirmText="Delete"
        type="error"
      />
    </div>
  );
}

export default RoomsPage;