const express = require('express');
const router = express.Router();

const { accounts } = require('../database/models');

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

router.use(async (req, res, next) => {
	const record = await accounts.findOne({
		where: {
			username: req.user.username || ''
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

//basic account management (needs a token)
router.delete('/logout', require('./logout'));
router.get('/account', require('./account-query'));
router.patch('/account', require('./account-update'));
router.delete('/account', require('./account-delete'));

module.exports = router;
