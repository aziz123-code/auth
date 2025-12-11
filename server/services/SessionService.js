import Session from "../models/Session.js"

async function createSession(userId) {
    return Session.create({
        user_id: userId,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
}


export default createSession