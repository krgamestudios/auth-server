const express = require('express');
const router = express.Router();

const { accounts } = require('../database/models');

//middleware
const tokenAuth = require('../utilities/token-auth');
const tokenDecode = require('../utilities/token-decode');

//signup -> validate -> login all without a token
router.post('/signup', require('./signup'));
router.get('/validation', require('./validation'));
router.post('/login', require('./login'));

//password recover and reset
router.post('/recover', require('./password-recover'));
router.get('/reset', require('./password-redirect'));
router.patch('/reset', require('./password-reset'));

//logouts allowed when banned, and when the token itself is invalid
router.delete('/logout', require('./logout'));

//authenticate token
router.use(tokenDecode);

//middleware
router.use(async (req, res, next) => {
	const record = await accounts.findOne({
		where: {
			email: req.user.email || ''
		}
	});

	if (!record) {
		return res.status(500).send('Account not found in banning middleware');
	}

	if (record.banned) {
		return res.status(403).send('This account has been banned');
	}

	next();
});

//refresh token
router.post('/token', require('./token'));

//authenticate token
router.use(tokenAuth);

//basic account management (needs a token)
router.get('/account', require('./account-query'));
router.patch('/account', require('./account-update'));
router.delete('/account', require('./account-delete'));

module.exports = router;
