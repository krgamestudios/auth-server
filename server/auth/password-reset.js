//libraries
const bcrypt = require('bcryptjs');

const { accounts, recovery } = require('../database/models');

//auth/reset
const route = async (req, res) => {
	//validate the given details
	const validateErr = await validateDetails(req.query, req.body);
	if (validateErr) {
		return res.status(401).send(validateErr);
	}

	//generate the password hash
	const hash = await bcrypt.hash(req.body.password, await bcrypt.genSalt(11));

	//update the account data
	accounts.update({
		hash: hash
	}, {
		where: {
			email: req.query.email
		}
	})

	//delete from the recovery table
	recovery.destroy({
		where: {
			email: req.query.email
		}
	});

	return null;
};

const validateDetails = async (query, body) => {
	//verify the recovery record exists
	const record = recovery.findOne({
		email: query.email,
		token: query.token
	});

	if (!record) {
		return 'Failed to recover a password';
	}

	//validate password
	if (!body.password) {
		return 'Missing password';
	}

	if (body.password.length < 8) {
		return 'Password too short';
	}

	return null;
};

module.exports = route;