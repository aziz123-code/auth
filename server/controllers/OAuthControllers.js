import OauthService from '../services/OAuthService.js';
import createSession from '../services/SessionService.js';
import generateGoogleAuthUrl from '../config/generateGoogleAuthUrl.js'

class OauthController {

    redirectToGoogle(req, res) {
        try {
            res.redirect(generateGoogleAuthUrl());
        } catch (err) {
            console.error("Ошибка редиректа:", err);
            res.redirect('/login')
        }
    }

    async googleCallback(req, res, next) {
        const { code, error, error_description } = req.query;
      
        if (error === 'access_denied') {
          return res.redirect('/login?oauth=cancelled');
        }
      
        if (error || !code) {
          console.warn('Google OAuth rejected:', error, error_description);
          return res.redirect('/login?oauth=error');
        }
      
        try {
          const user = await OauthService.handleGoogleCallback(code);
          const session = await createSession(user.id);
      
          res.cookie("token", session.session_id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
          });
      
          return res.redirect("/main/page");
      
        } catch (err) {
          
          err.status = 401;
          err.expose = true; 
          return next(err); 
        
      }
    }
}

export default new OauthController();
