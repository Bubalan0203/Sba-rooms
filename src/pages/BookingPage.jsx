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
  ListItemText,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Person as PersonIcon,
  Hotel as HotelIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from 'framer-motion';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95%',
  maxWidth: 900,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 0,
  maxHeight: '95vh',
  overflowY: 'auto'
};

function BookingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [step, setStep] = useState(0);
  const [numRooms, setNumRooms] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomDetails, setRoomDetails] = useState({});
  const [commonAmount, setCommonAmount] = useState('');
  
  // Guest Details State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [idProofBase64, setIdProofBase64] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = ['Select Rooms', 'Guest & Payment Details', 'Review & Confirm'];

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
    setStep(0);
    setNumRooms(1);
    setSelectedRooms([]);
    setRoomDetails({});
    setCommonAmount('');
    setGuestName('');
    setGuestPhone('');
    setIdProofBase64('');
    setIsSubmitting(false);
  };

  const handleNext = () => {
    if (step === 0 && selectedRooms.length !== parseInt(numRooms, 10)) {
      alert(`Please select exactly ${numRooms} room(s).`);
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
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
  
  const totalAmount = selectedRooms.reduce((total, roomId) => {
    const amount = parseFloat(roomDetails[roomId]?.amount || commonAmount || 0);
    return total + amount;
  }, 0);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: { xs: 2, sm: 3, md: 4 }, 
        px: { xs: 1, sm: 2, md: 3 },
        ml: { xs: 0, md: '280px' },
        width: { xs: '100%', md: 'calc(100% - 280px)' },
        maxWidth: { xs: '100%', md: 'none' },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'flex-start', md: 'center' }, 
          gap: { xs: 2, md: 3 }
        }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.primary.main, 
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Booking Management
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ textAlign: { xs: 'center', sm: 'left' } }}
            >
              Create new bookings and manage guest reservations
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{
              borderRadius: 3,
              px: { xs: 3, md: 4 },
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.shadows[4],
              alignSelf: { xs: 'center', md: 'flex-start' },
              minWidth: { xs: 200, md: 'auto' }
            }}
          >
            New Booking
          </Button>
        </Box>
      </Box>

      {/* Welcome Card */}
      <Paper
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
          border: `1px solid ${theme.palette.primary.main}30`,
          textAlign: 'center',
        }}
      >
        <HotelIcon sx={{ 
          fontSize: { xs: 48, sm: 56, md: 64 }, 
          color: theme.palette.primary.main, 
          mb: 2 
        }} />
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            mb: 2, 
            color: theme.palette.text.primary,
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
          }}
        >
          Ready to Create a New Booking?
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            mb: 3,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            maxWidth: { xs: '100%', sm: '80%', md: '60%' },
            mx: 'auto'
          }}
        >
          Click the "New Booking" button above to start the booking process for your guests.
        </Typography>
        <Button
          variant="outlined"
          onClick={handleOpenModal}
          sx={{
            borderRadius: 2,
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.5 },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Get Started
        </Button>
      </Paper>
        
      {/* Booking Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {/* Modal Header */}
          <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderBottom: `1px solid ${theme.palette.divider}` 
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Create New Booking
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Stepper activeStep={step} alternativeLabel={!isMobile}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconComponent={({ active, completed }) => (
                        <Avatar
                          sx={{
                            width: { xs: 28, sm: 32 },
                            height: { xs: 28, sm: 32 },
                            bgcolor: completed ? theme.palette.success.main : active ? theme.palette.primary.main : theme.palette.grey[300],
                            color: 'white',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
                          {completed ? <CheckIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} /> : index + 1}
                        </Avatar>
                      )}
                    >
                      {!isMobile && (
                        <Typography sx={{ fontSize: { sm: '0.875rem', md: '1rem' } }}>
                          {label}
                        </Typography>
                      )}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Box>

          {/* Modal Content */}
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <AnimatePresence mode="wait">
              {/* Step 1: Room Selection */}
              {step === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 3, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      justifyContent: { xs: 'center', sm: 'flex-start' }
                    }}
                  >
                    <HotelIcon color="primary" />
                    Select Rooms
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 3 }} size={isMobile ? "medium" : "medium"}>
                    <InputLabel>Number of Rooms</InputLabel>
                    <Select
                      value={numRooms}
                      label="Number of Rooms"
                      onChange={(e) => { setNumRooms(e.target.value); setSelectedRooms([]); }}
                    >
                      {[...Array(Math.min(10, rooms.length)).keys()].map(n => (
                        <MenuItem key={n + 1} value={n + 1}>{n + 1} Room{n > 0 ? 's' : ''}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 2,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      textAlign: { xs: 'center', sm: 'left' }
                    }}
                  >
                    Available Rooms ({selectedRooms.length} / {numRooms} selected)
                  </Typography>

                  <Paper variant="outlined" sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    maxHeight: { xs: 250, sm: 300 }, 
                    overflowY: 'auto', 
                    borderRadius: 2 
                  }}>
                    {rooms.length > 0 ? (
                      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                        {rooms.map(room => (
                          <Grid item xs={12} sm={6} md={4} key={room.id}>
                            <Card
                              sx={{
                                cursor: 'pointer',
                                border: selectedRooms.includes(room.id) ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                                bgcolor: selectedRooms.includes(room.id) ? `${theme.palette.primary.main}10` : 'background.paper',
                                transition: 'all 0.2s ease',
                                minHeight: { xs: 60, sm: 80 },
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                },
                              }}
                              onClick={() => handleRoomSelect(room.id)}
                            >
                              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={selectedRooms.includes(room.id)}
                                      disabled={!selectedRooms.includes(room.id) && selectedRooms.length >= numRooms}
                                      size={isMobile ? "small" : "medium"}
                                    />
                                  }
                                  label={
                                    <Box>
                                      <Typography 
                                        variant="subtitle2" 
                                        sx={{ 
                                          fontWeight: 600,
                                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                        }}
                                      >
                                        Room {room.roomNo}
                                      </Typography>
                                      <Chip
                                        label={room.roomType}
                                        size="small"
                                        sx={{
                                          bgcolor: theme.palette.secondary.light + '30',
                                          color: theme.palette.secondary.main,
                                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                          height: { xs: 20, sm: 24 }
                                        }}
                                      />
                                    </Box>
                                  }
                                />
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          textAlign: 'center', 
                          py: { xs: 3, sm: 4 },
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                      >
                        No available rooms found
                      </Typography>
                    )}
                  </Paper>
                </motion.div>
              )}

              {/* Step 2: Guest and Payment Details */}
              {step === 1 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 3, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      justifyContent: { xs: 'center', sm: 'flex-start' }
                    }}
                  >
                    <PersonIcon color="primary" />
                    Guest & Payment Details
                  </Typography>
                  
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ 
                        p: { xs: 2, sm: 3 }, 
                        borderRadius: 2, 
                        bgcolor: theme.palette.grey[50] 
                      }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 2,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            textAlign: { xs: 'center', sm: 'left' }
                          }}
                        >
                          Guest Information
                        </Typography>
                        <TextField
                          label="Guest Name"
                          fullWidth
                          required
                          value={guestName}
                          onChange={e => setGuestName(e.target.value)}
                          sx={{ mb: 2 }}
                          size={isMobile ? "medium" : "medium"}
                        />
                        <TextField
                          label="Phone Number"
                          type="tel"
                          fullWidth
                          required
                          value={guestPhone}
                          onChange={e => setGuestPhone(e.target.value)}
                          sx={{ mb: 2 }}
                          size={isMobile ? "medium" : "medium"}
                        />
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={<UploadIcon />}
                          sx={{ 
                            textTransform: 'none',
                            py: { xs: 1.5, sm: 1.5 }
                          }}
                        >
                          Upload ID Proof
                          <input type="file" accept="image/*" hidden onChange={handleFileChange} required />
                        </Button>
                        {idProofBase64 && (
                          <Alert 
                            severity="success" 
                            sx={{ 
                              mt: 1,
                              fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }}
                          >
                            ID Proof uploaded successfully
                          </Alert>
                        )}
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ 
                        p: { xs: 2, sm: 3 }, 
                        borderRadius: 2, 
                        bgcolor: theme.palette.grey[50] 
                      }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 2,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            textAlign: { xs: 'center', sm: 'left' }
                          }}
                        >
                          Room Details & Charges
                        </Typography>
                        <TextField
                          label="Common Amount (per room)"
                          type="number"
                          fullWidth
                          required
                          value={commonAmount}
                          onChange={handleCommonAmountChange}
                          sx={{ mb: 2 }}
                          size={isMobile ? "medium" : "medium"}
                        />
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ maxHeight: { xs: 150, sm: 200 }, overflowY: 'auto' }}>
                          {selectedRooms.map(roomId => {
                            const room = rooms.find(r => r.id === roomId);
                            return (
                              <Box key={roomId} sx={{ 
                                mb: 2, 
                                p: { xs: 1.5, sm: 2 }, 
                                border: `1px solid ${theme.palette.divider}`, 
                                borderRadius: 1 
                              }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    fontWeight: 600, 
                                    mb: 1,
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                  }}
                                >
                                  Room {room.roomNo}
                                </Typography>
                                <Grid container spacing={{ xs: 1, sm: 2 }}>
                                  <Grid item xs={6}>
                                    <TextField
                                      label="Persons"
                                      type="number"
                                      size="small"
                                      fullWidth
                                      required
                                      value={roomDetails[roomId]?.numberOfPersons || ''}
                                      onChange={(e) => handleDetailChange(roomId, 'numberOfPersons', e.target.value)}
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextField
                                      label="Amount"
                                      type="number"
                                      size="small"
                                      fullWidth
                                      value={roomDetails[roomId]?.amount || ''}
                                      onChange={(e) => handleDetailChange(roomId, 'amount', e.target.value)}
                                    />
                                  </Grid>
                                </Grid>
                              </Box>
                            );
                          })}
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {/* Step 3: Review & Confirm */}
              {step === 2 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 3, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      justifyContent: { xs: 'center', sm: 'flex-start' }
                    }}
                  >
                    <CheckIcon color="primary" />
                    Review & Confirm Booking
                  </Typography>
                  
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 2,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            textAlign: { xs: 'center', sm: 'left' }
                          }}
                        >
                          Guest Details
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 1,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}
                        >
                          <strong>Name:</strong> {guestName}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 2,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}
                        >
                          <strong>Phone:</strong> {guestPhone}
                        </Typography>
                        {idProofBase64 && (
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 600, 
                                mb: 1,
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                              }}
                            >
                              ID Proof:
                            </Typography>
                            <Box
                              component="img"
                              src={idProofBase64}
                              alt="ID Proof Preview"
                              sx={{
                                width: '100%',
                                maxWidth: { xs: 150, sm: 200 },
                                height: 'auto',
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 1,
                              }}
                            />
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 2,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            textAlign: { xs: 'center', sm: 'left' }
                          }}
                        >
                          Booking Summary
                        </Typography>
                        <List dense>
                          {selectedRooms.map(roomId => {
                            const room = rooms.find(r => r.id === roomId);
                            const finalAmount = parseFloat(roomDetails[roomId]?.amount || commonAmount || 0);
                            return (
                              <ListItem key={roomId} sx={{ px: 0, py: { xs: 0.5, sm: 1 } }}>
                                <ListItemText
                                  primary={`Room ${room.roomNo}`}
                                  secondary={`${roomDetails[roomId]?.numberOfPersons || 1} Person(s)`}
                                  primaryTypographyProps={{
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                  }}
                                  secondaryTypographyProps={{
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                  }}
                                />
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    fontWeight: 600,
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                  }}
                                >
                                  ₹{finalAmount.toFixed(2)}
                                </Typography>
                              </ListItem>
                            );
                          })}
                          <Divider sx={{ my: 1 }} />
                          <ListItem sx={{ px: 0, py: { xs: 1, sm: 1.5 } }}>
                            <ListItemText
                              primary={
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontWeight: 700,
                                    fontSize: { xs: '1rem', sm: '1.25rem' }
                                  }}
                                >
                                  Total Amount
                                </Typography>
                              }
                            />
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700, 
                                color: theme.palette.primary.main,
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                              }}
                            >
                              ₹{totalAmount.toFixed(2)}
                            </Typography>
                          </ListItem>
                        </List>
                      </Paper>
                    </Grid>
                  </Grid>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* Modal Footer */}
          <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderTop: `1px solid ${theme.palette.divider}`, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: { xs: 2, sm: 0 }
          }}>
            <Button
              onClick={step === 0 ? handleCloseModal : handleBack}
              sx={{ 
                textTransform: 'none', 
                borderRadius: 2,
                order: { xs: 2, sm: 1 },
                px: { xs: 4, sm: 3 }
              }}
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            
            {step < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ 
                  textTransform: 'none', 
                  borderRadius: 2, 
                  px: { xs: 4, sm: 4 },
                  order: { xs: 1, sm: 2 }
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{ 
                  textTransform: 'none', 
                  borderRadius: 2, 
                  px: { xs: 4, sm: 4 },
                  order: { xs: 1, sm: 2 }
                }}
              >
                {isSubmitting ? <CircularProgress size={20} /> : 'Confirm Booking'}
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
    </Container>
  );
}

export default BookingPage;