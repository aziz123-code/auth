import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

console.log("MAIL FILE LOADED");

const transport = nodemailer.createTransport({
    host: process.env.GMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
})

transport.verify((error, success) => {
    if (error) {
        console.error(" Ошибка SMTP:", error);
    } else {
        console.log(" SMTP Mailer готов к работе");
    }
});

export default transport;