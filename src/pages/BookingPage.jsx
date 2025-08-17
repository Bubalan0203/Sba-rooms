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

// Material UI Imports
import {
  Container,
  Typography,
  Button,
  Modal,
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// Custom theme using your logo's colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#26A69A", // Teal color
    },
    secondary: {
      main: "#424242", // Dark grey
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
});

// Style for the modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '90vh',
  overflowY: 'auto'
};


function BookingPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [step, setStep] = useState(1); // Now has 3 steps
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

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" color="primary">
                Booking Management
            </Typography>
            <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenModal}>
                Add New Booking
            </Button>
        </Box>
        <Typography variant="body1">Click the button above to start a new booking.</Typography>
        
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
            {/* Step 1: Room Selection */}
            {step === 1 && (
              <>
                <Typography variant="h5" component="h2" sx={{ mb: 3 }}>Step 1: Select Rooms</Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="num-rooms-label">How many rooms?</InputLabel>
                    <Select labelId="num-rooms-label" value={numRooms} label="How many rooms?" onChange={(e) => { setNumRooms(e.target.value); setSelectedRooms([]); }}>
                        {[...Array(Math.min(10, rooms.length)).keys()].map(n => (<MenuItem key={n + 1} value={n + 1}>{n + 1}</MenuItem>))}
                    </Select>
                </FormControl>
                <Typography variant="subtitle1" gutterBottom>Select Available Rooms ({selectedRooms.length} / {numRooms})</Typography>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflowY: 'auto', mb: 3 }}>
                    <FormGroup>
                        {loading ? <CircularProgress /> : rooms.map(room => (<FormControlLabel control={<Checkbox checked={selectedRooms.includes(room.id)} onChange={() => handleRoomSelect(room.id)} disabled={!selectedRooms.includes(room.id) && selectedRooms.length >= numRooms}/>} label={`${room.roomNo} (${room.roomType})`} key={room.id}/>))}
                    </FormGroup>
                </Paper>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleCloseModal} sx={{ mr: 1 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleProceedToDetails}>Next</Button>
                </Box>
              </>
            )}

            {/* Step 2: Guest and Payment Details */}
            {step === 2 && (
              <>
                <Typography variant="h5" component="h2" sx={{ mb: 3 }}>Step 2: Add Details</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={5}>
                        <Typography variant="h6" gutterBottom>Guest Details</Typography>
                        <TextField label="Guest Name" fullWidth required value={guestName} onChange={e => setGuestName(e.target.value)} sx={{ mb: 2 }} />
                        <TextField label="Phone Number" type="tel" fullWidth required value={guestPhone} onChange={e => setGuestPhone(e.target.value)} sx={{ mb: 2 }} />
                        <Button variant="outlined" component="label" fullWidth> Upload ID Proof <input type="file" accept="image/*" hidden onChange={handleFileChange} required /></Button>
                        {idProofBase64 && <Typography variant="caption" color="green" display="block" mt={1}>ID Proof selected.</Typography>}
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <Typography variant="h6" gutterBottom>Charges & Persons</Typography>
                        <TextField label="Common Amount (per room)" type="number" fullWidth required value={commonAmount} onChange={handleCommonAmountChange} sx={{ mb: 2 }} />
                        <Divider sx={{mb: 2}}/>
                        <Box sx={{ maxHeight: 250, overflowY: 'auto', pr: 1 }}>
                        {selectedRooms.map(roomId => {
                            const room = rooms.find(r => r.id === roomId);
                            return (
                                <Box key={roomId} sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>Room {room.roomNo}</Typography>
                                    <TextField label={`Persons in Room ${room.roomNo}`} type="number" fullWidth required value={roomDetails[roomId]?.numberOfPersons || ''} onChange={(e) => handleDetailChange(roomId, 'numberOfPersons', e.target.value)} sx={{ mb: 1 }}/>
                                    <TextField label={`Amount for Room ${room.roomNo}`} type="number" fullWidth value={roomDetails[roomId]?.amount || ''} onChange={(e) => handleDetailChange(roomId, 'amount', e.target.value)}/>
                                </Box>
                            );
                        })}
                        </Box>
                    </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button onClick={() => setStep(1)}>Back</Button>
                    <Button variant="contained" onClick={() => setStep(3)}>Preview Booking</Button>
                </Box>
              </>
            )}

            {/* ############ START OF NEW PREVIEW STEP ############ */}
            {step === 3 && (
                <>
                    <Typography variant="h5" component="h2" sx={{ mb: 3 }}>Step 3: Confirm Booking</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>Guest Details</Typography>
                            <Typography variant="body1"><strong>Name:</strong> {guestName}</Typography>
                            <Typography variant="body1"><strong>Phone:</strong> {guestPhone}</Typography>
                            <Typography variant="h6" gutterBottom sx={{mt: 2}}>ID Proof</Typography>
                            {idProofBase64 ? 
                                <Box component="img" src={idProofBase64} alt="ID Proof Preview" sx={{ width: '100%', maxWidth: '250px', border: '1px solid #ddd', borderRadius: '4px' }} /> :
                                <Typography variant="body2" color="error">No ID proof uploaded.</Typography>
                            }
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>Booking Summary</Typography>
                            <List dense>
                                {selectedRooms.map(roomId => {
                                    const room = rooms.find(r => r.id === roomId);
                                    const finalAmount = parseFloat(roomDetails[roomId]?.amount || commonAmount || 0);
                                    return (
                                        <ListItem key={roomId} divider>
                                            <ListItemText 
                                                primary={`Room ${room.roomNo}`}
                                                secondary={`${roomDetails[roomId]?.numberOfPersons || 1} Person(s)`}
                                            />
                                            <Typography variant="body1">₹{finalAmount.toFixed(2)}</Typography>
                                        </ListItem>
                                    );
                                })}
                                <ListItem>
                                    <ListItemText primary={<Typography variant="h6">Total</Typography>} />
                                    <Typography variant="h6">₹{totalAmount.toFixed(2)}</Typography>
                                </ListItem>
                            </List>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button onClick={() => setStep(2)}>Back to Edit</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={24} /> : 'Confirm & Book Now'}
                        </Button>
                    </Box>
                </>
            )}
            {/* ############ END OF NEW PREVIEW STEP ############ */}
          </Box>
        </Modal>
      </Container>
    </ThemeProvider>
  );
}

export default BookingPage;