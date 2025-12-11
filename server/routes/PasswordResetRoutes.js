import express from 'express'
import PasswordResetController  from '../controllers/PasswordResetController.js'

const router = express.Router()

router.post('/reset-password', PasswordResetController.sendCode)
router.post('/reset-code', PasswordResetController.verifyCode)
router.post('/new-password', PasswordResetController.setNewPassword)
router.post('/resend-code', PasswordResetController.sendCode)

export default router
