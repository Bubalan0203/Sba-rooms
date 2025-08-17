import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Hotel, 
  Snowflake, 
  Wind,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { cn } from "../lib/utils";

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomNo, setRoomNo] = useState("");
  const [roomType, setRoomType] = useState("AC");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const roomsCollection = collection(db, "rooms");

  // Fetch rooms in real-time
  useEffect(() => {
    const q = query(roomsCollection, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomsData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const resetForm = () => {
    setRoomNo("");
    setRoomType("AC");
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomNo.trim()) return;

    try {
      if (editId) {
        const roomRef = doc(db, "rooms", editId);
        await updateDoc(roomRef, {
          roomNo,
          roomType,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(roomsCollection, {
          roomNo,
          roomType,
          status: "Available",
          createdAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (error) {
      console.error("Error saving room:", error);
    }
  };

  const handleEdit = (room) => {
    setEditId(room.id);
    setRoomNo(room.roomNo);
    setRoomType(room.roomType);
  };

  const handleDeleteClick = (room) => {
    setRoomToDelete(room);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (roomToDelete) {
      try {
        await deleteDoc(doc(db, "rooms", roomToDelete.id));
        setShowDeleteDialog(false);
        setRoomToDelete(null);
      } catch (error) {
        console.error("Error deleting room:", error);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available':
        return <CheckCircle className="h-4 w-4" />;
      case 'Booked':
        return <XCircle className="h-4 w-4" />;
      case 'Maintenance':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Hotel className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Booked':
        return 'destructive';
      case 'Maintenance':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getRoomTypeIcon = (type) => {
    return type === 'AC' ? <Snowflake className="h-4 w-4" /> : <Wind className="h-4 w-4" />;
  };

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
            <h1 className="text-3xl font-bold text-foreground">Room Management</h1>
            <p className="text-muted-foreground">Manage your hotel rooms and their availability</p>
          </div>
        </motion.div>

        {/* Add/Edit Room Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editId ? "Edit Room" : "Add New Room"}
              </CardTitle>
              <CardDescription>
                {editId ? "Update room details" : "Add a new room to your inventory"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Room Number (e.g., 101)"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    required
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                  >
                    <option value="AC">AC Room</option>
                    <option value="Non-AC">Non-AC Room</option>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {editId ? "Update" : "Add Room"}
                  </Button>
                  {editId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rooms Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                All Rooms ({rooms.length})
              </CardTitle>
              <CardDescription>
                Overview of all rooms in your hotel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No rooms found</h3>
                  <p className="text-muted-foreground mb-4">Get started by adding your first room</p>
                  <Button onClick={() => document.querySelector('input').focus()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Room
                  </Button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {rooms.map((room, index) => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                        className="group"
                      >
                        <Card className="h-full hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getRoomTypeIcon(room.roomType)}
                                <h3 className="font-semibold text-lg">Room {room.roomNo}</h3>
                              </div>
                              <Badge 
                                variant={getStatusVariant(room.status)}
                                className="flex items-center gap-1"
                              >
                                {getStatusIcon(room.status)}
                                {room.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Type:</span>
                                <span className="font-medium">{room.roomType}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Status:</span>
                                <span className={cn(
                                  "font-medium",
                                  room.status === 'Available' && "text-green-600",
                                  room.status === 'Booked' && "text-red-600",
                                  room.status === 'Maintenance' && "text-yellow-600"
                                )}>
                                  {room.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(room)}
                                className="flex-1"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteClick(room)}
                                className="flex-1"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <AnimatePresence>
          {showDeleteDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-lg p-6 max-w-md w-full border shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Delete Room</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-foreground mb-6">
                  Are you sure you want to delete <strong>Room {roomToDelete?.roomNo}</strong>? 
                  This will permanently remove the room from your system.
                </p>
                
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmDelete}
                  >
                    Delete Room
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default RoomsPage;