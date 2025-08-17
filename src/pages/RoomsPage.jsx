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

// Material UI Imports
import {
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControl,
  InputLabel,
  Box,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomNo, setRoomNo] = useState("");
  const [roomType, setRoomType] = useState("AC");
  const [editId, setEditId] = useState(null);

  // State for the delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const roomsCollection = collection(db, "rooms");

  // Fetch rooms in real-time and order them by creation date
  useEffect(() => {
    const q = query(roomsCollection, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomsData);
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
  };

  // --- Delete Dialog Logic ---
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
  // -------------------------

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" align="center">
          Rooms Management
        </Typography>

        {/* Form is now inside a Paper component for better UI */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" component="h2" gutterBottom color="secondary">
            {editId ? "Edit Room" : "Add a New Room"}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Room No"
              variant="outlined"
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
              required
              fullWidth
            />
            <FormControl variant="outlined" sx={{ minWidth: 150 }}>
              <InputLabel id="room-type-label">Room Type</InputLabel>
              <Select
                labelId="room-type-label"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                label="Room Type"
              >
                <MenuItem value="AC">AC</MenuItem>
                <MenuItem value="Non-AC">Non-AC</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" color="primary" sx={{ height: '56px', px: 4 }}>
              {editId ? "Update" : "Add"}
            </Button>
          </Box>
        </Paper>

        {/* Rooms List is inside another Paper component */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom color="secondary">
            Available Rooms
          </Typography>
          <List>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <ListItem
                  key={room.id}
                  divider
                  secondaryAction={
                    <>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(room)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(room.id)} sx={{ color: '#D32F2F' }}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemText
                    primary={`Room No: ${room.roomNo}`}
                    secondary={`Type: ${room.roomType} | Status: ${room.status}`}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
                No rooms found. Please add a new room using the form above.
              </Typography>
            )}
          </List>
        </Paper>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this room? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} sx={{ color: '#D32F2F' }} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default RoomsPage;