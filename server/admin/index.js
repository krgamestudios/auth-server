const express = require('express');
const router = express.Router();

const { accounts } = require('../database/models');

//middleware
const tokenAuth = require('../utilities/token-auth');

router.use(tokenAuth);

//handle ban stuff
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

//handle mod stuff
router.use((req, res, next) => {
	//check the user's mod status
	if (!req.user.mod) {
		return res.status(401).send('Mods only');
	}

	next();
});

//routes
router.post('/banuser', require('./ban-user'));

//handle admin stuff
router.use((req, res, next) => {
	//check the user's admin status
	if (!req.user.admin) {
		return res.status(401).send('Admin only');
	}

	next();
});

require('./default-account')(); //generate the default accouunt

//basic route management
router.post('/admin', require('./grant-admin'));
router.delete('/admin', require('./remove-admin'));
router.post('/mod', require('./grant-mod'));
router.delete('/mod', require('./remove-mod'));

module.exports = router;