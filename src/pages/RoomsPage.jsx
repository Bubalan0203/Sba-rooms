import React, { useEffect, useState } from "react";
// Make sure you have a valid 'db' export from your Firebase config file.
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
import {
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Box,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  useTheme,
  useMediaQuery,
  Fab,
  Divider,
  Avatar,
  LinearProgress,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Hotel as HotelIcon,
  AcUnit as AcIcon,
  Air as FanIcon,
  CheckCircle as AvailableIcon,
  Cancel as BookedIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from 'framer-motion';


function RoomsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [rooms, setRooms] = useState([]);
  const [roomNo, setRoomNo] = useState("");
  const [roomType, setRoomType] = useState("AC");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // --- Real Firebase Firestore connection ---
  const roomsCollection = collection(db, "rooms");
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
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomNo.trim()) return;

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
  };

  const handleEdit = (room) => {
    setEditId(room.id);
    setRoomNo(room.roomNo);
    setRoomType(room.roomType);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDeleteDialog = (id) => {
    setRoomToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setRoomToDelete(null);
  };

  const confirmDelete = async () => {
    if (roomToDelete) {
      await deleteDoc(doc(db, "rooms", roomToDelete));
    }
    handleCloseDeleteDialog();
  };

  const getRoomIcon = (type) => {
    return type === "AC" ? <AcIcon /> : <FanIcon />;
  };

  const getStatusIcon = (status) => {
    return status === "Available" ? <AvailableIcon color="success" /> : <BookedIcon color="error" />;
  };

  const getStatusColor = (status) => {
    return status === "Available" ? theme.palette.success.main : theme.palette.error.main;
  };

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
              component="h1" 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.primary.main, 
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Room Management
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ textAlign: { xs: 'center', sm: 'left' } }}
            >
              Manage your hotel rooms and their availability.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              borderRadius: 3,
              px: { md: 3, lg: 4 },
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.shadows[4],
              minWidth: { md: 160 }
            }}
          >
            Add New Room
          </Button>
        </Box>
      </Box>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                mb: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}10 100%)`,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: theme.palette.text.primary,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                {editId ? "Edit Room" : "Add New Room"}
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} alignItems="end">
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Room Number"
                      variant="outlined"
                      value={roomNo}
                      onChange={(e) => setRoomNo(e.target.value)}
                      required
                      fullWidth
                      size={isMobile ? "medium" : "medium"}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Room Type</InputLabel>
                      <Select
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        label="Room Type"
                        size={isMobile ? "medium" : "medium"}
                      >
                        <MenuItem value="AC">AC Room</MenuItem>
                        <MenuItem value="Non-AC">Non-AC Room</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      gap: { xs: 1.5, sm: 2 },
                      width: '100%'
                    }}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth={isMobile}
                        sx={{
                          px: { xs: 2, sm: 3, md: 4 },
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          minWidth: { sm: 120 }
                        }}
                      >
                        {editId ? "Update" : "Add Room"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={resetForm}
                        fullWidth={isMobile}
                        sx={{
                          px: { xs: 2, sm: 3 },
                          py: 1.5,
                          textTransform: 'none',
                          minWidth: { sm: 100 }
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rooms Grid */}
      <Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 3, 
            color: theme.palette.text.primary,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          All Rooms ({rooms.length})
        </Typography>
        
        {rooms.length > 0 ? (
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
            {rooms.map((room, index) => (
              <Grid item xs={12} sm={6} md={4} xl={3} key={room.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  style={{ height: '100%' }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: theme.shadows[2],
                      transition: 'all 0.3s ease',
                      border: `1px solid ${theme.palette.divider}`,
                      borderLeft: `5px solid ${getStatusColor(room.status)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: { xs: 140, sm: 160 },
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                        borderColor: getStatusColor(room.status),
                      },
                    }}
                  >
                    <CardContent sx={{ 
                      p: { xs: 2, sm: 2.5 }, 
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'primary.contrastText',
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 }
                        }}>
                          <HotelIcon />
                        </Avatar>
                        <Chip
                          icon={getStatusIcon(room.status)}
                          label={room.status}
                          size="small"
                          sx={{
                            bgcolor: `${getStatusColor(room.status)}20`,
                            color: getStatusColor(room.status),
                            fontWeight: 600,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            height: { xs: 24, sm: 28 }
                          }}
                        />
                      </Box>
                      
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          mb: 1,
                          fontSize: { xs: '1rem', sm: '1.125rem' }
                        }}
                      >
                        Room {room.roomNo}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getRoomIcon(room.roomType)}
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          {room.roomType}
                        </Typography>
                      </Box>
                    </CardContent>
                    
                    <Divider />
                    
                    <CardActions sx={{ 
                      p: { xs: 1, sm: 1.5 }, 
                      justifyContent: 'flex-end',
                      gap: 0.5
                    }}>
                      <IconButton 
                        onClick={() => handleEdit(room)} 
                        aria-label="edit room" 
                        sx={{ 
                          color: 'primary.main',
                          size: { xs: 'small', sm: 'medium' }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleOpenDeleteDialog(room.id)} 
                        aria-label="delete room" 
                        sx={{ 
                          color: 'error.main',
                          size: { xs: 'small', sm: 'medium' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            sx={{
              p: { xs: 3, sm: 4, md: 6 },
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: 'grey.50',
              border: `2px dashed ${theme.palette.grey[300]}`,
            }}
          >
            <HotelIcon sx={{ 
              fontSize: { xs: 40, sm: 48, md: 64 }, 
              color: 'grey.400', 
              mb: 2 
            }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 1, 
                color: 'text.secondary',
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              No rooms found
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              Get started by adding your first room.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              sx={{
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 }
              }}
            >
              Add First Room
            </Button>
          </Paper>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        PaperProps={{ 
          sx: { 
            borderRadius: 3, 
            p: 1,
            mx: { xs: 2, sm: 0 },
            width: { xs: 'calc(100% - 32px)', sm: 'auto' }
          } 
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ 
          fontWeight: 600,
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ 
            fontSize: { xs: '0.875rem', sm: '1rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            Are you sure you want to permanently delete this room? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            fullWidth={isMobile}
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            fullWidth={isMobile}
            sx={{ order: { xs: 1, sm: 2 } }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add room"
          onClick={() => {
            setShowForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          sx={{
            position: 'fixed',
            bottom: { xs: 20, sm: 24 },
            right: { xs: 20, sm: 24 },
            zIndex: 1000,
            width: { xs: 52, sm: 56 },
            height: { xs: 52, sm: 56 }
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
}

// To make this a runnable standalone component, we wrap it in a ThemeProvider.
// In your actual app, you might have a global ThemeProvider already.
export default function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <RoomsPage />
    </ThemeProvider>
  );
}
