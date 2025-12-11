import Session from "./Session.js"; 
import User from "./User.js";
import Oauth from "./Oauth.js";


User.hasMany(Session, { foreignKey: 'user_id', onDelete: 'CASCADE' })
Session.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' }),

User.hasOne(Oauth, { foreignKey: 'user_id', onDelete: 'CASCADE' })
Oauth.belongsTo(User, {foreignKey: 'user_id', onDelete: 'CASCADE'})


export {Session, User, Oauth}