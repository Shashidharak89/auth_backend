import express from 'express'
import { registerUser, loginUser,verifyUser,updateCoin,dailyCheckIn,findUserNameOfwinner } from '../controllers/usersController.js'

// Creating an instance of Express router
const router = express.Router()

// Register user route
router.post('/', registerUser)

// Login user route
router.post('/login', loginUser)

router.get('/verifyuser', verifyUser)

router.put('/update-coin',updateCoin)

router.post('/checkin',dailyCheckIn)

router.get('/:id',findUserNameOfwinner);

export { router as usersRoutes }
