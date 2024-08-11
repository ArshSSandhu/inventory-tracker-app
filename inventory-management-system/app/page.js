'use client'
import Image from "next/image"
import {useState, useEffect} from 'react'
import {firestore} from '@/firebase'
import {Box, Modal, Typography, Stack, TextField, Button} from '@mui/material'
import {
  collection, 
  getDocs , 
  query,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore'

import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

export default function Home() {
 const [inventory, setInventory] = useState([])
 const [open, setOpen] = useState(false)
 const [itemName, setItemName] = useState('')

const updateInventory = async () =>{
  const snapshot = query(collection(firestore, 'inventory'))
  const docs = await getDocs(snapshot)
  const inventoryList = []
  docs.forEach((doc)=>{
    inventoryList.push({
      name: doc.id,
      ...doc.data()    
    })
  })

  setInventory(inventoryList)
}

const addItem = async (item) =>{
  const standardizedItem = item.toLowerCase()
  const docRef = doc(collection(firestore, 'inventory'), standardizedItem)
  const docSnap = await getDoc(docRef)

  if(docSnap.exists()){
    const {quantity} = docSnap.data()
    await setDoc(docRef, {quantity: quantity +1})
  } else{
    await setDoc(docRef, {quantity: 1})
  }

  await updateInventory()
}

const removeItem = async (item) =>{
  const docRef = doc(collection(firestore, 'inventory'), item)
  const docSnap = await getDoc(docRef)

  if(docSnap.exists()){
    const {quantity} = docSnap.data()
    if (quantity === 1){
      await deleteDoc(docRef)
    } else{
      await setDoc(docRef, {quantity: quantity-1})
    }
  }

  await updateInventory()
}

useEffect(()=>{
  updateInventory()
}, [])

const handleOpen = () => setOpen(true)
const handleClose = () => setOpen(false)

return(
  <Box
    width="100vw"
    height="100vh"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    gap={4} //increased gap for more breathing room
    padding={4} //arounf box
    bgcolor="#f5f5f5"
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
        <Typography variant="h6" textAlign="center" >Add Item</Typography>
        <Stack width="100%" direction="row" spacing={3}>
          <TextField
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) =>{
              setItemName(e.target.value)
            }}
          />
          <Button
            variant="outlined"
            onClick={ ()=>{
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
          >
            Add
          </Button>
        </Stack>
      </Box>
    </Modal>

    <Button
      variant="contained"
      onClick={()=>{
        handleOpen()
      }}
    >
      Add New Item
    </Button>
    <Box border="1px solid #333">
      <Box 
        width="800px" 
        height="100px" 
        bgcolor="#ADD8E6" 
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h3" color="#333" fontWeight="bold">
          Inventory Items
        </Typography>
      </Box>

      <Stack width="800px" height="300px" spacing={2} overflow="auto">
  {inventory.map(({name, quantity}) => (
    <Box
      key={name}
      width="100%"
      minHeight="150px"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      bgcolor="#f0f0f0"
      padding={3}
      sx={{
        transition: 'background-color 0.3s',
        '&:hover': {
          backgroundColor: '#e0e0e0',
        },
      }}
    >
            <Typography variant="h3" color="#333" textAlign="center">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>

            <Typography variant="h3" color="#333" textAlign="center">
              {quantity}
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={()=>{
                  addItem(name)
                }}
              >
                Add
              </Button>

              <Button
                variant="contained"
                color="error" // Different color for Remove
                startIcon={<RemoveIcon />}
                onClick={()=>{
                  removeItem(name)
                }}
              >
                Remove
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  </Box>
)
}
