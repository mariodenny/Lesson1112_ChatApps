import express from 'express'
const router = express.Router()

import {
    registerPage,
    loginPage,
    registerUser,
    loginUser,
    logoutUser,
    chatPage
} from '../controllers/AuthController.js'

router.get("/register", registerPage)
router.get('/login', loginPage)
router.post('/login', loginUser)
router.post('/register', registerUser)
router.get("/logout", logoutUser)

export default router
