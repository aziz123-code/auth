import pg from "pg"
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config();

export let pool;

async function createDatabase() {
     const systemPool = new Pool({
        connectionString: process.env.DATABASE_URL_SYSTEM
    });

    const dbName = 'project_db';

    try {
        // Используем параметризованный запрос для безопасности
        const result = await systemPool.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );
        if (result.rowCount === 0) {
            await systemPool.query(`CREATE DATABASE ${dbName}`)
            console.log(`База ${dbName} создана!`)
        } else {
            console.log(`База ${dbName} уже существует`)
        }

        pool = new Pool({
            connectionString: process.env.DATABASE_URL
        })

    } catch (error) {
        console.error('Ошибка при создание базы', error)
    } finally {
        await systemPool.end()
    }
}

export default createDatabase
