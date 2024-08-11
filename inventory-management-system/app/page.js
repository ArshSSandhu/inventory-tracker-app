'use client'
import Image from "next/image"
import { useState, useEffect } from 'react'
import { firestore } from '@/firebase'
import { Box, Modal, Typography, Stack, TextField, Button, AppBar, Toolbar, Snackbar, Alert, Grid } from '@mui/material'
import {
  collection,
  getDocs,
  query,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import Grow from '@mui/material/Grow'

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1)
  const [itemPrice, setItemPrice] = useState('') // New state for price
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      })
    })

    setInventory(inventoryList)
  }

  const addItem = async (item, quantity, price) => {
    const standardizedItem = item.toLowerCase()
    const docRef = doc(collection(firestore, 'inventory'), standardizedItem)
    const docSnap = await getDoc(docRef)

    const totalPrice = price * quantity;

    if (docSnap.exists()) {
      const { quantity: currentQuantity, price: currentPrice } = docSnap.data()
      await setDoc(docRef, { quantity: currentQuantity + quantity, price: currentPrice })
      setSnackbarMessage(`Increased quantity of ${standardizedItem} by ${quantity}`)
      setSnackbarSeverity('success')
    } else {
      await setDoc(docRef, { quantity, price })
      setSnackbarMessage(`Added new item: ${standardizedItem} with quantity ${quantity} and price $${price}`)
      setSnackbarSeverity('success')
    }

    setSnackbarOpen(true)
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity, price } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
        setSnackbarMessage(`Removed item: ${item}`)
        setSnackbarSeverity('info')
      } else {
        await setDoc(docRef, { quantity: quantity - 1, price })
        setSnackbarMessage(`Decreased quantity of ${item}`)
        setSnackbarSeverity('warning')
      }
    } else {
      setSnackbarMessage(`Item not found: ${item}`)
      setSnackbarSeverity('error')
    }

    setSnackbarOpen(true)
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  return (
    <Box>
      {/* Navbar */}
      <AppBar position="static" sx={{ bgcolor: 'black' }} >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inventory Management System
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={4}
        padding={4}
        bgcolor="#f5f5f5"
        sx={{
          backgroundImage: 'url()',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Typography variant="h6" textAlign="center">Add Item</Typography>
            <Stack width="100%" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                label="Item Name"
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value)
                }}
              />
              <TextField
                variant="outlined"
                fullWidth
                label="Quantity"
                type="number"
                value={itemQuantity}
                onChange={(e) => {
                  setItemQuantity(Number(e.target.value))
                }}
                inputProps={{ min: 1 }}
              />
              <TextField
                variant="outlined"
                fullWidth
                label="Price ($)"
                type="number"
                value={itemPrice}
                onChange={(e) => {
                  setItemPrice(e.target.value)
                }}
                inputProps={{ min: 0.01, step: 0.01 }}
              />
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  addItem(itemName, itemQuantity, parseFloat(itemPrice))
                  setItemName('')
                  setItemQuantity(1)
                  setItemPrice('')
                  handleClose()
                }}
                startIcon={<AddIcon />}
              >
                Add to Cart
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Button
          variant="contained"
          color="success"
          onClick={() => {
            handleOpen()
          }}
          startIcon={<AddIcon />}
        >
          Add New Item
        </Button>

        <Box
  border="1px solid #333"
  bgcolor="#ffffff"
  padding={3}
  borderRadius={4}
  boxShadow="0px 3px 15px rgba(0, 0, 0, 0.2)"
  width="100%"
  maxWidth="1200px" // Set a maximum width
  maxHeight="80vh" // Maximum height for vertical growth
  overflow="auto" // Enable scrolling if the content overflows
  display="flex"
  flexDirection="column" // Ensure it stacks items vertically
>
  <Box
    bgcolor=""
    width="100%"
    height="100px"
    display="flex"
    alignItems="center"
    justifyContent="center"
    borderRadius={2}
    mb={2} // margin-bottom for spacing
  >
    <Typography variant="h5" color="#333" fontWeight="bold">
      Inventory Items
    </Typography>
  </Box>

  <Grid container spacing={2}>
    {inventory.map(({ name, quantity, price }) => (
      <Grid item xs={12} sm={6} md={4} key={name}>
        <Grow in={true} timeout={500}>
          <Box
            width="100%"
            minHeight="200px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            bgcolor="#f0f0f0"
            padding={2}
            borderRadius={4}
            boxShadow="0px 2px 10px rgba(0, 0, 0, 0.1)"
            sx={{
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            <Typography variant="h5" color="#333" textAlign="center">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
            <Typography variant="h6" color="#333" textAlign="center" mt={1}>
              Quantity: {quantity} (${price ? price.toFixed(2) : '0.00'} each, Total: ${(price && quantity ? (price * quantity).toFixed(2) : '0.00')})
            </Typography>

            <Stack direction="row" spacing={2} mt={2}>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => {
                  addItem(name, 1, price || 0) // Default price is 0 if undefined
                }}
              >
                Add
              </Button>

              <Button
                variant="contained"
                color="error"
                startIcon={<RemoveIcon />}
                onClick={() => {
                  removeItem(name)
                }}
              >
                Remove
              </Button>
            </Stack>
          </Box>
        </Grow>
      </Grid>
    ))}
  </Grid>
</Box>

      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        action={
          <Button color="inherit" onClick={handleSnackbarClose}>
            Close
          </Button>
        }
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
