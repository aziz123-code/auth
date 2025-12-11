import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL;

const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (error) => console.error('Redis выдал ошибку', error));
redisClient.on('connect', () => console.log('Redis подключен'));
redisClient.on('ready', () => console.log('Redis готов к работе'));

let isConnected = false;
const connectRedis = async () => {
    if (isConnected) return redisClient;
    
    try {
        await redisClient.connect();
        isConnected = true;
        return redisClient;
    } catch (error) {
        console.error('Ошибка подключения к Redis:', error);
        throw error;
    }
};

connectRedis().catch(err => {
    console.error('Не удалось подключиться к Redis при старте:', err);
});

export default redisClient;