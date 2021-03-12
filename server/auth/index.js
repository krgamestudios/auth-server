const express = require('express');
const router = express.Router();

//middleware
const tokenAuth = require('../utilities/token-auth');

//signup -> validate -> login all without a token
router.post('/signup', require('./signup'));
router.get('/validation', require('./validation'));
router.post('/login', require('./login'));

//refresh token
router.post('/token', require('./token'));

//middleware
router.use(tokenAuth);

//basic account management (needs a token)
router.delete('/logout', require('./logout'));
router.get('/account', require('./account'));
router.patch('/update', require('./update'));
router.delete('/deletion', require('./deletion'));

router.patch('/account/privilege', require('./account-privilege'));

module.exports = router;
