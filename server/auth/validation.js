const { pendingSignups, accounts } = require('../database/models');
const fetch = require('node-fetch');

//auth/validation
const route = async (req, res) => {
	//get the existing pending signup
	const info = await pendingSignups.findOne({
		where: {
			username: req.query.username || ''
		}
	});

	//check the given info
	if (!info) {
		return res.status(401).send('Validation failed');
	}

	if (info.token != req.query.token) {
		return res.status(401).send('Tokens do not match');
	}

	//move data to the accounts table
	const account = await accounts.create({
		email: info.email,
		username: info.username,
		hash: info.hash,
		contact: info.contact
	});

	//delete the pending signup
	pendingSignups.destroy({
		where: {
			username: info.username || ''
		}
	});

	//finally
	res.status(200).send('Validation succeeded!');

	//post-validation hook
	if (process.env.HOOK_POST_VALIDATION) {
		const probe = await fetch(`https://${process.env.HOOK_POST_VALIDATION}?accountIndex=${account.index}`);

		if (!probe.ok) {
			console.error('Could not probe the post validation hook');
		}

		//discard the result
	}
};

module.exports = route;