import { DataTypes, Sequelize, } from 'sequelize'
import sequelize from '../config/sequelize.js'


const Oauth = sequelize.define('Oauth', {

    provider: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    provider_user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },

}, {
    tableName: 'oauth',
    timestamps: false,
    underscored: true
})


export default Oauth