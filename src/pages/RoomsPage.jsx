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
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 1 }}>
              Room Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your hotel rooms and their availability
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.shadows[4],
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Paper
              elevation={4}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
                border: `1px solid ${theme.palette.primary.main}30`,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
                {editId ? "Edit Room" : "Add New Room"}
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Room Number"
                      variant="outlined"
                      value={roomNo}
                      onChange={(e) => setRoomNo(e.target.value)}
                      required
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Room Type</InputLabel>
                      <Select
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        label="Room Type"
                        sx={{
                          borderRadius: 2,
                        }}
                      >
                        <MenuItem value="AC">AC Room</MenuItem>
                        <MenuItem value="Non-AC">Non-AC Room</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          borderRadius: 2,
                          px: 4,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {editId ? "Update" : "Add Room"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={resetForm}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          textTransform: 'none',
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
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
          All Rooms ({rooms.length})
        </Typography>
        
        {rooms.length > 0 ? (
          <Grid container spacing={3}>
            {rooms.map((room, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={room.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: theme.shadows[2],
                      transition: 'all 0.3s ease',
                      border: `2px solid ${getStatusColor(room.status)}20`,
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                        borderColor: getStatusColor(room.status),
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: `${theme.palette.primary.main}20`,
                            color: theme.palette.primary.main,
                            width: 48,
                            height: 48,
                          }}
                        >
                          <HotelIcon />
                        </Avatar>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(room.status)}
                        </Box>
                      </Box>
                      
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Room {room.roomNo}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        {getRoomIcon(room.roomType)}
                        <Typography variant="body2" color="text.secondary">
                          {room.roomType}
                        </Typography>
                      </Box>
                      
                      <Chip
                        label={room.status}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(room.status)}20`,
                          color: getStatusColor(room.status),
                          fontWeight: 600,
                          borderRadius: 2,
                        }}
                      />
                    </CardContent>
                    
                    <Divider />
                    
                    <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                      <IconButton
                        onClick={() => handleEdit(room)}
                        sx={{
                          color: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: `${theme.palette.primary.main}20`,
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenDeleteDialog(room.id)}
                        sx={{
                          color: theme.palette.error.main,
                          '&:hover': {
                            bgcolor: `${theme.palette.error.main}20`,
                          },
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
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: theme.palette.grey[50],
              border: `2px dashed ${theme.palette.grey[300]}`,
            }}
          >
            <HotelIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.secondary }}>
              No rooms found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Get started by adding your first room
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
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
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this room? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
            }}
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
          onClick={() => setShowForm(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
}

export default RoomsPage;