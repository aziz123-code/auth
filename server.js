import app from "./server/app.js"
import startServer  from "./server/config/database.js";
import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT || 5000;


async function main() {
    await startServer()
    app.listen(PORT, () => console.log(`Сервер запущен и слушает порт ${PORT}`))
}

main()


