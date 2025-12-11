import createDatabase from './pgPool.js'
import sequelize from './sequelize.js'
import {Session, User, Oauth} from '../models/index.js'

import dotenv from 'dotenv'
dotenv.config()

async function startServer() {
    await createDatabase()

    try {
        await sequelize.authenticate()
        console.log('Sequelize подключено к базе!')

        await User.sync({ alter: true })
        console.log('Таблица users создана через Sequelize или уже существует')

        await Session.sync({ alter: true })
        console.log('Таблица sessions создана через Sequelize или уже сужествует')

        await Oauth.sync({ alter: true })
        console.log('Таблица oauth создана через Sequelize или уже сужествует')

    } catch (error) {
        console.error('Ошибка создания таблиц: ', error)
    }
} 

export default startServer













