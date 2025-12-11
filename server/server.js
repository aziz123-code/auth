import app from "./app.js"
import startServer  from "./config/database.js";

const PORT = process.env.PORT || 5000;


async function main() {
    await startServer()
    app.listen(PORT, () => console.log(`Сервер запущен и слушает порт ${PORT}`))
}

main()


