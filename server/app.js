import express from "express";
import cookieParser from 'cookie-parser';
import AuthRoutes from './routes/AuthRoutes.js'
import PasswordResetRoutes from './routes/PasswordResetRoutes.js'
import AuthMiddleware from './middleware/auth.js'
import errorMiddleware from "./middleware/errorMiddleware.js";
import OauthRoutes from './routes/OAuthRoutes.js'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const app = express()


app.use(express.json())
app.use(cookieParser())

app.use(express.static(path.join(__dirname, '../../clients/public')));


app.use('/secure', AuthMiddleware,  express.static(path.join(__dirname, '../clients/secure')));


app.use("/api/auth", AuthRoutes)
app.use("/api/reset", PasswordResetRoutes)
app.use('/api/oauth', OauthRoutes)

app.use('/', AuthRoutes)

app.use((req, res) => {
    res.status(404).json({success: false, message: 'Маршрут нее найден' })
}) 

app.use(errorMiddleware)


export default app