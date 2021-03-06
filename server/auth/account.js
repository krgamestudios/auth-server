const { accounts } = require('../database/models');

//auth/account
const route = async (req, res) => {
	const account = await accounts.findOne({
		where: {
			id: req.user.id
		}
	});

	if (!account) {
		res.status(401).send('Unknown account');
	}

	//respond with the private-facing data
	res.status(200).json({
		contact: await account.contact
	});
};

module.exports = route;