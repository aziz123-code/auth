import authService from "../services/AuthService.js"
import createSession from "../services/SessionService.js"


class AuthController {
    register = async(req, res, next) => {
        try {
            const {email, username, password} = req.body

            await authService.register(email, username, password)

            res.status(200).json({ message: "Подтвердите код" })
        } catch (error) {
            next(error)
        }
    }


    verifyRegister = async(req, res, next) => {
        try {
            const {email, code} = req.body
            const user = await authService.verifyRegisterCode(email, code)

            const session = await createSession(user.id)
            const token = session.session_id

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000
            })

            res.status(201).json({ message: 'Регистрация подтверждена' })

        } catch (error) {
            next(error)
        }
    }

    login = async(req, res, next) => {
        try {
            const {email, password} = req.body

            const user = await authService.login(email, password)

            const session = await createSession(user.id)
            const token = session.session_id

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000
            })

            console.log("login token: ", token)

            res.status(200).json({ message: "Успешный вход" })
        } catch (error) {
            next(error)
        }
    }

    logout = async (req, res, next) => {
        try {
            const sessionId = req.cookies.token

            if(!sessionId) return res.redirect('/login')

            await authService.logout(sessionId)

            res.clearCookie('token')

            res.status(200).json({ message: 'Сессия успешно удалено. Выход выполнен' })
        } catch (error) {
            next(error)
        }
    }

    delete = async(req, res, next) => {
        try {
            const sessionId = req.cookies.token
            if(!sessionId) return res.redirect('/login')

            await authService.delete(sessionId)

            res.clearCookie('token')

            res.status(200).json({ message: 'Аккаунт успешно удален' })
        } catch (error) {
            next(error)
        }
    }
}

export default new AuthController()
