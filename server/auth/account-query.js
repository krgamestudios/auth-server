const { accounts } = require('../database/models');

//auth/account
const route = async (req, res) => {
	const account = await accounts.findOne({
		where: {
			index: req.user.index
		}
	});

	if (!account) {
		return res.status(401).send('Unknown account');
	}

	//respond with the private-facing data
	return res.status(200).json({
		contact: account.contact
	});
};

module.exports = route;