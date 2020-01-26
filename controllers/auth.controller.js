const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const SECRET = process.env.SECRET;

router.post('/login', (req, res, next) => {
    passport.authenticate('local-login', (err1, user, info) => {
        if (err1) {
            return res.status(500).json({
                message: err1.message
            });
        }
        if (!user) {
            return res.status(400).json(info);
        } else {
            req.logIn(user, (err2, id) => {
                if (err2) {
                    return res.status(500).json({
                        message: err2.message
                    });
                } else {
                    return res.status(200).json(user);
                }
            });
        }
    })(req, res, next);
});

router.post('/register', (req, res, next) => {
    passport.authenticate('local-register', (err, user, info) => {
        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }
        if (!user) {
            return res.status(400).json(info);
        } else {
            return res.status(200).json({
                message:'User Registered Successfully'
            });
        }
    })(req, res, next);
});

router.delete('/logout', (req, res, next) => {
    req.logOut();
    res.status(200).json({
        message: 'User Logged out!'
    });
});


router.get('/google', passport.authenticate('google'));

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
    res.end(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Passport Test</title>
    </head>
    
    <body>
        <h1>User was logged in</h1>
    </body>
    
    <script>
        window.opener.postMessage('hello World');
    </script>
    
    </html>`)
});


module.exports = router;
