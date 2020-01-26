const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const passport = require('passport');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(expressSession);

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const init = require('./passport');

const PROTOCOL = process.env.PROTOCOL;
const FQDN = process.env.FQDN;
const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const SECRET = process.env.SECRET;
const MONGODB_URL = process.env.MONGODB_URL;

const logger = log4js.getLogger('Server');
const app = express();

mongoose.connect(MONGODB_URL, (err) => {
    if (err) {
        logger.error(err);
    }
});

init();

log4js.configure({
    appenders: { 'out': { type: 'stdout' }, file: { type: 'multiFile', base: 'logs/', property: 'categoryName', extension: '.log', maxLogSize: 10485760, backups: 3, compress: true } },
    categories: { default: { appenders: ['out', 'file'], level: LOG_LEVEL } }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession({
    secret: SECRET,
    name: 'passport-auth',
    saveUninitialized: false,
    resave: false,
    rolling: true,
    store: new MongoStore({
        url: MONGODB_URL,
        ttl: 7200
    }),
    cookie: {
        domain: FQDN,
        secure: PROTOCOL && PROTOCOL === 'https'
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    logger.info(req.method, req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.path);
    next();
});

app.use((req, res, next) => {
    if (req.path.indexOf('/auth') > -1 || req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({
            message: 'Unauthorised'
        });
    }
})

app.use('/api', require('./controllers'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, (err) => {
    if (!err) {
        logger.info('Server is listening on port', PORT);
    } else {
        logger.error(err);
    }
});