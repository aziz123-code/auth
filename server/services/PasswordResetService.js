import redisClient from "../config/redis.js";
import bcrypt from 'bcrypt'
import mailService from './MailService.js'
import fs from 'fs/promises'
import path from "path";
import User from "../models/User.js";
import {Op} from 'sequelize'

class PasswordResetService {

    async sendResetCode(email) {
        const user = await User.findOne({
            where: {
                email,
                password : {[Op.ne]: null}
            }
        })

        if(!user) throw new Error('Если аккаунт существует — он создан через Google. Войдите через Google')
    
        const code = Math.floor(100000  + Math.random() * 900000).toString()
        if (!code) throw new Error('Ошибка генерации кода')
        let html = await fs.readFile(path.resolve('./reset-password.html'), 'utf-8')

        console.log(code)
        html = html.replace(`{{RESET_CODE}}`, code)
        const hashed = await bcrypt.hash(code, 5)

        await redisClient.setEx(`reset_code:${email}`, 300, hashed)

        mailService.sendResetCode(email, code, html)
        .catch(err => console.log('Ошибка при отправке письма') )
    }

    async verifyCode(email, code) {
        const saved = await redisClient.get(`reset_code:${email}`);
        if (!saved || !(await bcrypt.compare(code, saved))) {
            throw new Error('Код неверный или истек')
        }
        
        await redisClient.del(`reset_code:${email}`)
        await redisClient.setEx(`reset_ok:${email}`, 120, '1')
    }

    async setNewPassword(email, password) {
        const allowed = await redisClient.get(`reset_ok:${email}`)
        if(!allowed) throw new Error('Сначала подтвердите код')

        const hashed = await bcrypt.hash(password, 5)
        
        await User.update(
            {password: hashed},
            {where: {email} }
        )

        await redisClient.del(`reset_code:${email}`)
        await redisClient.del(`reset_ok:${email}`)
    }
}


export default new PasswordResetService()