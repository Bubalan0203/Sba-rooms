import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  collection,
  onSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarPlus, 
  Users, 
  DollarSign, 
  Phone, 
  User, 
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Hotel,
  CreditCard,
  FileText
} from "lucide-react";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { cn, formatCurrency } from "../lib/utils";

function BookingPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [step, setStep] = useState(1);
  const [numRooms, setNumRooms] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomDetails, setRoomDetails] = useState({});
  const [commonAmount, setCommonAmount] = useState('');
  
  // Guest Details State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [idProofBase64, setIdProofBase64] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const roomsCollection = collection(db, "rooms");
    const q = query(roomsCollection, where("status", "==", "Available"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setNumRooms(1);
    setSelectedRooms([]);
    setRoomDetails({});
    setCommonAmount('');
    setGuestName('');
    setGuestPhone('');
    setIdProofBase64('');
    setIsSubmitting(false);
  };

  const handleProceedToDetails = () => {
    if (selectedRooms.length !== parseInt(numRooms, 10)) {
        alert(`Please select exactly ${numRooms} room(s).`);
        return;
    }
    setStep(2);
  };

  const handleRoomSelect = (roomId) => {
    setSelectedRooms(prev => {
        const newSelection = prev.includes(roomId)
            ? prev.filter(id => id !== roomId)
            : [...prev, roomId];
        
        newSelection.forEach(id => {
            if (!roomDetails[id]) {
                setRoomDetails(prevDetails => ({
                    ...prevDetails,
                    [id]: { numberOfPersons: '', amount: commonAmount }
                }));
            }
        });
        return newSelection;
    });
  };

  const handleDetailChange = (roomId, field, value) => {
    setRoomDetails(prev => ({
        ...prev,
        [roomId]: { ...prev[roomId], [field]: value }
    }));
  };

  const handleCommonAmountChange = (e) => {
    const newAmount = e.target.value;
    setCommonAmount(newAmount);
    setRoomDetails(prevDetails => {
        const newDetails = { ...prevDetails };
        selectedRooms.forEach(roomId => {
            newDetails[roomId] = { ...newDetails[roomId], amount: newAmount };
        });
        return newDetails;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdProofBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guestName || !guestPhone || !idProofBase64) {
      alert("Cannot submit. Guest details are missing.");
      return;
    }
    setIsSubmitting(true);
    try {
      await runTransaction(db, async (transaction) => {
        const bookingsCollection = collection(db, "bookings");
        for (const roomId of selectedRooms) {
          const roomRef = doc(db, "rooms", roomId);
          const room = rooms.find(r => r.id === roomId);
          const finalAmount = parseFloat(roomDetails[roomId]?.amount || commonAmount || 0);
          transaction.set(doc(bookingsCollection), {
            roomId: roomId,
            roomNo: room.roomNo,
            numberOfPersons: parseInt(roomDetails[roomId]?.numberOfPersons || 1, 10),
            amount: finalAmount,
            guestName: guestName,
            customerPhone: guestPhone,
            idProof: idProofBase64,
            checkIn: serverTimestamp(),
            checkOut: null,
            status: 'Active',
            createdAt: serverTimestamp()
          });
          transaction.update(roomRef, { status: "Booked" });
        }
      });
      alert('Booking successful!');
      handleCloseModal();
    } catch (error) {
      alert('Booking failed! The selected room(s) might have just been booked.');
      console.error("Transaction failed: ", error);
      setIsSubmitting(false);
    }
  };
  
  // Calculate total amount for the preview
  const totalAmount = selectedRooms.reduce((total, roomId) => {
    const amount = parseFloat(roomDetails[roomId]?.amount || commonAmount || 0);
    return total + amount;
  }, 0);

  const StepIndicator = ({ currentStep, totalSteps }) => (
    <div className="flex items-center justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
        <React.Fragment key={stepNum}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
            stepNum === currentStep 
              ? "bg-primary text-primary-foreground" 
              : stepNum < currentStep 
                ? "bg-green-500 text-white" 
                : "bg-muted text-muted-foreground"
          )}>
            {stepNum < currentStep ? <CheckCircle className="h-4 w-4" /> : stepNum}
          </div>
          {stepNum < totalSteps && (
            <div className={cn(
              "w-12 h-0.5 mx-2 transition-all",
              stepNum < currentStep ? "bg-green-500" : "bg-muted"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Booking Management</h1>
          <p className="text-muted-foreground">Create new bookings for your guests</p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarPlus className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Ready to Book?</h2>
              <p className="text-muted-foreground mb-6">
                Start creating a new booking for your guests. We'll guide you through the process step by step.
              </p>
              <Button onClick={handleOpenModal} size="lg" className="w-full">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Create New Booking
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border shadow-xl"
              >
                <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">New Booking</h2>
                  <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-6">
                  <StepIndicator currentStep={step} totalSteps={3} />

                  <form onSubmit={handleSubmit}>
                    {/* Step 1: Room Selection */}
                    {step === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <Hotel className="h-12 w-12 text-primary mx-auto mb-2" />
                          <h3 className="text-lg font-semibold">Select Rooms</h3>
                          <p className="text-muted-foreground">Choose the rooms for your booking</p>
                        </div>

                        <div className="max-w-xs mx-auto">
                          <label className="block text-sm font-medium mb-2">Number of Rooms</label>
                          <Select
                            value={numRooms}
                            onChange={(e) => { setNumRooms(e.target.value); setSelectedRooms([]); }}
                          >
                            {[...Array(Math.min(10, rooms.length)).keys()].map(n => (
                              <option key={n + 1} value={n + 1}>{n + 1} Room{n > 0 ? 's' : ''}</option>
                            ))}
                          </Select>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Available Rooms</h4>
                            <Badge variant="secondary">
                              {selectedRooms.length} / {numRooms} selected
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                            {rooms.map(room => (
                              <motion.div
                                key={room.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Card 
                                  className={cn(
                                    "cursor-pointer transition-all",
                                    selectedRooms.includes(room.id) 
                                      ? "ring-2 ring-primary bg-primary/5" 
                                      : "hover:shadow-md",
                                    !selectedRooms.includes(room.id) && selectedRooms.length >= numRooms && "opacity-50 cursor-not-allowed"
                                  )}
                                  onClick={() => {
                                    if (selectedRooms.includes(room.id) || selectedRooms.length < numRooms) {
                                      handleRoomSelect(room.id);
                                    }
                                  }}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium">Room {room.roomNo}</p>
                                        <p className="text-sm text-muted-foreground">{room.roomType}</p>
                                      </div>
                                      {selectedRooms.includes(room.id) && (
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            type="button" 
                            onClick={handleProceedToDetails}
                            disabled={selectedRooms.length !== parseInt(numRooms, 10)}
                          >
                            Next Step
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <FileText className="h-12 w-12 text-primary mx-auto mb-2" />
                          <h3 className="text-lg font-semibold">Booking Details</h3>
                          <p className="text-muted-foreground">Enter guest information and pricing</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Guest Details */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Guest Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Guest Name *</label>
                                <Input
                                  placeholder="Enter guest name"
                                  value={guestName}
                                  onChange={e => setGuestName(e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                                <Input
                                  type="tel"
                                  placeholder="Enter phone number"
                                  value={guestPhone}
                                  onChange={e => setGuestPhone(e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">ID Proof *</label>
                                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="id-proof"
                                    required
                                  />
                                  <label htmlFor="id-proof" className="cursor-pointer">
                                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                      {idProofBase64 ? "ID Proof uploaded ✓" : "Click to upload ID proof"}
                                    </p>
                                  </label>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Room Details */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Pricing & Occupancy
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Common Amount (per room)</label>
                                <Input
                                  type="number"
                                  placeholder="Enter amount"
                                  value={commonAmount}
                                  onChange={handleCommonAmountChange}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-3 max-h-40 overflow-y-auto">
                                {selectedRooms.map(roomId => {
                                  const room = rooms.find(r => r.id === roomId);
                                  return (
                                    <div key={roomId} className="p-3 bg-muted/50 rounded-lg">
                                      <p className="font-medium mb-2">Room {room.roomNo}</p>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-xs font-medium mb-1">Persons</label>
                                          <Input
                                            type="number"
                                            min="1"
                                            placeholder="1"
                                            value={roomDetails[roomId]?.numberOfPersons || ''}
                                            onChange={(e) => handleDetailChange(roomId, 'numberOfPersons', e.target.value)}
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium mb-1">Amount</label>
                                          <Input
                                            type="number"
                                            placeholder="Amount"
                                            value={roomDetails[roomId]?.amount || ''}
                                            onChange={(e) => handleDetailChange(roomId, 'amount', e.target.value)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="flex justify-between">
                          <Button type="button" variant="outline" onClick={() => setStep(1)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                          </Button>
                          <Button type="button" onClick={() => setStep(3)}>
                            Preview Booking
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Preview */}
                    {step === 3 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                          <h3 className="text-lg font-semibold">Confirm Booking</h3>
                          <p className="text-muted-foreground">Review all details before confirming</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Guest Summary */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Guest Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium">{guestName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="font-medium">{guestPhone}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">ID Proof:</span>
                                {idProofBase64 && (
                                  <img
                                    src={idProofBase64}
                                    alt="ID Proof"
                                    className="mt-2 w-full max-w-xs rounded-lg border"
                                  />
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Booking Summary */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {selectedRooms.map(roomId => {
                                  const room = rooms.find(r => r.id === roomId);
                                  const finalAmount = parseFloat(roomDetails[roomId]?.amount || commonAmount || 0);
                                  return (
                                    <div key={roomId} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                      <div>
                                        <p className="font-medium">Room {room.roomNo}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {roomDetails[roomId]?.numberOfPersons || 1} person(s)
                                        </p>
                                      </div>
                                      <span className="font-semibold">{formatCurrency(finalAmount)}</span>
                                    </div>
                                  );
                                })}
                                <div className="border-t pt-3 flex justify-between items-center">
                                  <span className="text-lg font-semibold">Total:</span>
                                  <span className="text-lg font-bold text-primary">{formatCurrency(totalAmount)}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="flex justify-between">
                          <Button type="button" variant="outline" onClick={() => setStep(2)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Edit
                          </Button>
                          <Button type="submit" disabled={isSubmitting} size="lg">
                            {isSubmitting ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                              />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default BookingPage;