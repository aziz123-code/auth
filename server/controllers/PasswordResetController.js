import passwordResetService from "../services/PasswordResetService.js";


class ResetController {
    sendCode = async (req, res, next) => {
        try {
            const {email} = req.body
            await passwordResetService.sendResetCode(email)

            res.status(200).json({ message: 'Код отправлен!' })
        } catch (error) {
            next(error)
        }
    }

    verifyCode = async (req, res, next) => {
        try {
            const {code, email} = req.body
            await passwordResetService.verifyCode(email, code)
            res.status(200).json({ message: 'Код верный!' })
        } catch (error) {
            next(error)
        }
    }


    setNewPassword = async (req, res, next) => {
        try {
            const {email, password} = req.body
            await passwordResetService.setNewPassword(email, password)
            res.json({ message: 'Пароль успешно обновлен' })
        } catch (error) {
            next(error)
        }
    }
}

export default new ResetController()