const bcrypt = require('bcryptjs');
const { accounts } = require('../database/models');

//auth/update
const route = async (req, res) => {
	if (!req.body.password) {
		return res.status(401).end('Missing password');
	}

	//generate the password hash
	let hash = await bcrypt.hash(req.body.password, await bcrypt.genSalt(11));

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