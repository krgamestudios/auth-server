//libraries
const utils = require('util');
const bcrypt = require('bcryptjs');

const { accounts } = require('../database/models');
const generate = require('../utilities/token-generate');

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
			email: req.body.email
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
			id: account.id
		}
	});

	//generate the JWT
	const tokens = generate(account.id, account.username, account.privilege);

	//finally
	res.status(200).json(tokens);
};

const validateDetails = async (body) => {
	//basic formatting (with an exception for the default admin account)
	if (!validateEmail(body.email) && body.email != `admin@${process.env.WEB_ADDRESS}`) {
		return 'invalid email';
	}
	//TODO: restore default admin account

	//check for existing (banned)
	//TODO: restore banning

	return null;
}

module.exports = route;