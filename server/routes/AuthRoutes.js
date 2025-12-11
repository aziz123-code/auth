import express from 'express'
import AuthController from '../controllers/AuthController.js'
import AuthMiddleware from '../middleware/auth.js'
import path from 'path'
import { fileURLToPath } from 'url';

const router = express.Router()


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/verify-register', AuthController.verifyRegister)
router.delete('/logout', AuthController.logout)
router.delete('/delete-account', AuthController.delete)



router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../clients/public/login.html'))
})

router.get('/verify-register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../clients/public/verify-register.html'))
})


router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../clients/public/register.html'))
})


router.get('/reset-code', (req, res) => {
    res.sendFile(path.join(__dirname, '../../clients/public/reset-code.html'))
})

router.get('/new-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../../clients/public/new-password.html'))
})

router.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../../clients/public/reset-password.html'))
})

router.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../../clients/public/script.js'))
})

router.get('/assets/logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, '../../clients/assets/logo.png'))
})

router.get('/main/page', AuthMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../../clients/secure/index.html'));
});



export default router