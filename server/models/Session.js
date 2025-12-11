import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";


const Session = sequelize.define('Session', {
    session_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true,
    },
    
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },

}, {
    tableName: 'sessions',
    timestamps: false,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['expires_at'] }
    ]
});


export default Session