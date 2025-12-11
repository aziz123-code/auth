import { URLSearchParams } from 'url';
import dotenv from 'dotenv';
import { User, Oauth } from '../models/index.js';
dotenv.config();

class OauthService {
    async handleGoogleCallback(code) {
        const params = new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code'
        });

        const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });

        if (!res.ok) {
            throw new Error(`Ошибка обмена кода: ${res.status}`);
        }

        const data = await res.json();
        const { id_token } = data;

        const base64Payload = id_token.split('.')[1];
        const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());

        const googleId = payload.sub;      
        const email = payload.email;
        let username = payload.name;

        console.log(`Google info => id: ${googleId}, email: ${email}, username: ${username}`);

        const originalName = username;
        let baseName = originalName

        let existsUserName = await User.findOne({
            where: {username}
        })
        
        let  maxAttepmpts = 100
        let count = 1
        while(existsUserName && count < maxAttepmpts){
            baseName = originalName + '_' + count
            existsUserName = await User.findOne({
                where: {username: baseName}
            })
            if(!existsUserName) {
                username = baseName
                break
            }
            count++
        }
    

        console.log("Итоговое уникальное username:", username);
        const oauthCheck = await Oauth.findOne({
            where: { provider_user_id: googleId }
        });

        let user;

        if (oauthCheck) {
            user = await User.findByPk(oauthCheck.user_id);
            console.log("Пользователь найден через OAuth:", user?.toJSON?.() ?? user);
        } else {
            const existingByEmail = await User.findOne({ where: { email } });

            if (existingByEmail) {
                user = existingByEmail;
                await Oauth.findOrCreate({
                    where: { provider_user_id: googleId },
                    defaults: { provider: 'Google', user_id: user.id }
                });
                console.log("Существующий пользователь по email связан с OAuth");
            } else {
                user = await User.create({
                    email,
                    username,
                    password: null
                });

                await Oauth.create({
                    provider: 'Google',
                    provider_user_id: googleId,
                    user_id: user.id
                });

                console.log("Создан новый user + oauth запись");
            }
        }

        return user;
    }
}

export default new OauthService();
