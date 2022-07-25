//libraries
const utils = require('util');
const bcrypt = require('bcryptjs');

const { accounts } = require('../database/models');
const tokenGenerateRefresh = require('../utilities/token-generate-refresh');

//utilities
const validateEmail = require('../utilities/validate-email');

//auth/login
const route = async (req, res) => {
	//validate the given details
	const validateErr = await validateDetails(req.body);
	if (validateErr) {
		return res.status(401).send(validateErr);
	}

	//get the existing account
	const account = await accounts.findOne({
		where: {
			email: req.body.email || ''
		}
	});

	if (!account) {
		return res.status(401).send('incorrect email or password');
	}

	//compare passwords
	const compare = utils.promisify(bcrypt.compare);

	const match = await compare(req.body.password, account.hash);

	if (!match) {
		return res.status(401).send('incorrect email or password');
	}

	//cancel deletion if any
	await accounts.update({ deletion: null }, {
		where: {
			index: account.index
		}
	});

	//reject on banned
	if (account.banned) {
		return res.status(403).send('this account has been banned');
	}

	//generate the JWTs
	const { accessToken, refreshToken } = tokenGenerateRefresh(account.index, account.email, account.username, account.type, account.admin, account.mod);

	//set the cookie
	res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 60 * 60 * 24 * 30 }); //30 days

	//finally
	res.status(200).send(accessToken);
	return null;
};

const validateDetails = async (body) => {
	if (!body.email) {
		return 'Missing email';
	}

	if (!body.password) {
		return 'Missing password';
	}

	//basic formatting (with an exception for the default admin account)
	if (!validateEmail(body.email) && body.email != `${process.env.ADMIN_DEFAULT_USERNAME}@${process.env.WEB_ADDRESS}`) {
		return 'Invalid email';
	}

	return null;
}

module.exports = route;