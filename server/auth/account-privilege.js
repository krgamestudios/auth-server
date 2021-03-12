const { accounts } = require('../database/models');

//auth/account/privilege
const route = async (req, res) => {
	//check the user's privilege
	if (req.user.privilege != 'administrator') {
		return res.status(401).send('Only admins can change privilege');
	}

	const updated = await accounts.update({
		privilege: req.body.privilege
	}, {
		where: {
			username: req.body.username
		}
	});

	if (updated < 1) {
		return res.status(403).send(`Unknown account`);
	}

	return res.status(200).end();
};

module.exports = route;