import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../config/sequelize.js";

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true
    },

    email: {
        type: DataTypes.STRING,
         allowNull: false,
          unique: true
        },

    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
        },

    password: {
        type: DataTypes.STRING,
         allowNull: true
        },
        
    created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
}, {
    tableName: "users",
    timestamps: false,
    underscored: true,

});

export default User

