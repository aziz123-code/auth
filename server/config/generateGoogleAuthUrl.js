import { URLSearchParams } from 'url'
import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()


function generateGoogleAuthUrl() {
    const params = new URLSearchParams({
        client_id : process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        response_type: 'code',  // code в обмен на token
        scope: 'openid email profile', // то что хочу получить от google
        state: crypto.randomUUID(),
        access_type: 'offline',  // refresh token 
        prompt: 'consent'// Заставляет Google каждый раз показывать окно разрешения.
    })  

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

}

export default generateGoogleAuthUrl


