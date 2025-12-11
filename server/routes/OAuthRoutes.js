import express from 'express'
import OAuthController  from '../controllers/OAuthControllers.js'

const router = express.Router()

router.get('/google', OAuthController.redirectToGoogle)

router.get('/google/callback', OAuthController.googleCallback)


export default router