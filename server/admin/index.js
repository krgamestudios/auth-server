const express = require('express');
const router = express.Router();

//middleware
const tokenAuth = require('../utilities/token-auth');

router.use(tokenAuth);
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