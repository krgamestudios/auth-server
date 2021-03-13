const express = require('express');
const router = express.Router();

//middleware
const tokenAuth = require('../utilities/token-auth');

router.use(tokenAuth);
router.use((req, res, next) => {
	//check the user's privilege
	if (req.user.privilege != 'administrator') {
		return res.status(401).send('Admins only');
	}

	next();
});

require('./default-account')(); //generate the default accouunt

//basic route management
router.patch('/privilege', require('./account-privilege'));

module.exports = router;