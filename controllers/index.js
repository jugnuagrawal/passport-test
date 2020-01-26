const router = require('express').Router();

router.use('/auth', require('./auth.controller'));


module.exports = router;
