import transport from '../config/mailer.js'


class MailService {
    sendResetCode(email, code, html) {
        return transport.sendMail({
            from: `"YOUMARKET PRO" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Сброс пароля',
            text: `Ваш код ${code}`,
            html: html,
            attachments: [
                {
                    filename: 'logo',
                    path: './logo.png',
                    cid: 'logo'
                }
            ]
        }) 
    }

    SendVerifyRegisterCode(email, code, html) {
        return transport.sendMail({
            from: `"YOUMARKET PRO" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Подтверждение регистрации',
            text: `Ваш код для подтверждение регистрации: ${code}`,
            html: html,
            attachments: [
                {
                    filename: 'logo',
                    path: './logo.png',
                    cid: 'logo'
                }
            ]
        })
    }
}


export default new MailService()
