import Session from '../models/Session.js'

const auth = async(req, res, next) => {
    try {
        const session_id = req.cookies.token

        if(!session_id) return res.redirect('/login')

        const session = await Session.findOne({
            where: { session_id },
            attributes: ['user_id', 'expires_at']
        })

        const now = new Date()

        if(!session) return res.redirect('/login')

        if(session.expires_at < now) return res.redirect('/login')

        req.user = {id: session.user_id}

        next()
    } catch (error) {
        next(error)

    }
}


export default auth