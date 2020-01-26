const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userModel = require('./models/user.model');

const PROTOCOL = process.env.PROTOCOL;
const FQDN = process.env.FQDN;
const SECRET = process.env.SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

function init() {
    passport.use('local-login', new LocalStrategy({}, async (username, password, done) => {
        const user = await userModel.findByUsername(username);
        if (!user) {
            return done(null, false, {
                message: 'Invalid Username/Password'
            });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return done(null, false, {
                message: 'Invalid Username/Password'
            });
        }
        done(null, user, {
            message: 'User Found'
        });
    }));

    passport.use('local-register', new LocalStrategy({
        passReqToCallback: true
    }, async (req, username, password, done) => {
        try {
            const body = req.body;
            const user = await userModel.findByUsername(username);
            if (user) {
                return done(null, false, {
                    message: 'User Already Exist'
                });
            }
            body.password = await bcrypt.hash(password, 10);
            const status = await userModel.createUser(body);
            done(null, status, {
                message: 'User Registerd'
            });
        } catch (err) {
            done(err, false);
        }
    }));

    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: PROTOCOL + FQDN + '/api/auth/google/callback',
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        console.log(accessToken, refreshToken, profile);
        done(null, profile);
        // try {
        //     const body = req.body;
        //     const user = await userModel.findByUsername(username);
        //     if (user) {
        //         return done(null, false, {
        //             message: 'User Already Exist'
        //         });
        //     }
        //     body.password = await bcrypt.hash(password, 10);
        //     const status = await userModel.createUser(body);
        //     done(null, status, {
        //         message: 'User Registerd'
        //     });
        // } catch (err) {
        //     done(err, false);
        // }
    }));

    passport.serializeUser((user, done) => {
        try {
            delete user.password;
            const token = jwt.sign(user, SECRET, {
                expiresIn: 7200,
                issuer: 'https://auth.agrawaltech.com'
            });
            done(null, token);
        } catch (err) {
            done(err, false);
        }
    });

    passport.deserializeUser((id, done) => {
        try {
            const user = jwt.verify(id, SECRET);
            done(null, user);
        } catch (err) {
            done(err, false);
        }
    });
}


module.exports = init;