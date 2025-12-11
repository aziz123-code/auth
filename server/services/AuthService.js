import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from "path";
import MailService from '../services/MailService.js';
import redisClient from '../config/redis.js';
import User from '../models/User.js';
import Session from '../models/Session.js';

class AuthService {
    async register(email, username, password) {
        const existsEmail = await User.findOne({ where: { email } });
        if (existsEmail) {
            const err = new Error("Аккаунт с этим email уже существует. Попробуйте войти через Google");
            err.status = 400;
            throw err;
        }

        const existsUserName = await User.findOne({ where: { username } });
        if (existsUserName) {
            const err = new Error("Пользователь с таким именем уже существует");
            err.status = 400;
            throw err;
        }

        const code = Math.floor(100000  + Math.random() * 900000).toString()
        console.log(code)
        let html = await fs.readFile(path.resolve('./verifyLogin.html'), 'utf-8')
        
        html = html.replace(`{{RESET_CODE}}`, code)

        const hashed = await bcrypt.hash(code, 5)

        await redisClient.setEx(`register_code:${email}`, 120, hashed)
        await redisClient.hSet(`register_data:${email}`, {
            email,
            username,
            password: await bcrypt.hash(password, 5)
        }) 

        await redisClient.expire(`register_data:${email}`, 300)    
        MailService.SendVerifyRegisterCode(email, code, html)
        .catch(err => console.error('Ошибка при отправке письма', err))

        return { message: 'Код отправлен'}

    }

    async verifyRegisterCode(email, code) {
        const saved = await redisClient.get(`register_code:${email}`);
        if(!saved) {
            const err = new Error('Код неверный или истек');
            err.status = 400;
            throw err;
        }

        const ok = await bcrypt.compare(code, saved);
        if(!ok) {
            const err = new Error('Неверный код');
        }

        const userData = await redisClient.hGetAll(`register_data:${email}`);
        if (!userData || !userData.email) {
            const err = new Error('Данные регистрации отсутствуют');
            err.status = 400;
            throw err;
        }

        const result = await User.create({
            email: userData.email,
            username: userData.username,
            password: userData.password
        });

        await redisClient.setEx(`register_ok:${email}`, 1200, '1');
        await redisClient.del(`register_data:${email}`);
        await redisClient.del(`register_code:${email}`);

        return { id: result.id, email: result.email, username: result.username };
    }


    async login(email, password) {
        const user = await User.findOne({
            where: { email },
            attributes: ['id', 'email', 'username', 'password']
        });

        if (!user) {
            const err = new Error('Неверный email. Попробуйте еще раз');
            err.status = 400;
            throw err;
        }

        if(!user.password) {
            const err = new Error('Этот аккаунт зарегистрирован через Google. Войдите через Google');
            err.status = 400;
            throw err;
        }
        
        const ok = await bcrypt.compare(password, user.password)
        if (!ok) {
            const err = new Error('Неверный пароль');
            err.status = 400;
            throw err;
        }

        return {id: user.id, email: user.email, username: user.username}
    }

    async logout(sessionId) {
        await Session.destroy({ where: { session_id: sessionId }});
        return true
    }

    async delete(sessionId) {
        const session = await Session.findOne({
            where: { session_id: sessionId },
            attributes: ['user_id']
        });

        if (!session) return false;

        await User.destroy({ where: { id: session.user_id } });
        await Session.destroy({ where: { session_id: sessionId } });
        return true;
    }
}



export default new AuthService()

