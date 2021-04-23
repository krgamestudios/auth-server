const bcrypt = require('bcryptjs');
const { accounts } = require('../database/models');

//auth/update
const route = async (req, res) => {
	//generate the password hash
	let hash;

	if (req.body.password) {
		hash = await bcrypt.hash(req.body.password, await bcrypt.genSalt(11));
	}

	//update the account
	await accounts.update({
		contact: req.body.contact,
		hash: hash
	}, {
		where: {
			index: req.user.index
		}
	});

	//respond with an OK
	res.status(200).end();
};

module.exports = route;