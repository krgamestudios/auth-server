const { accounts, recovery } = require('../database/models');

//auth/reset
const route = async (req, res) => {
	//verify the recovery record exists
	const record = recovery.findOne({
		token: req.query.token
	});

	if (!record) {
		return res.status(401).end('Failed to recover a password');
	}

	//redirect to the front-end
	res.redirect(`${process.env.WEB_PROTOCOL}${process.env.WEB_RESET_ADDRESS}?email=${record.email}&token=${record.token}`);
	return null;
};

module.exports = route;