const { pendingSignups, accounts } = require('../database/models');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

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
	if (process.env.HOOK_POST_VALIDATION_ARRAY) {
		try {
			hooks = JSON.parse(process.env.HOOK_POST_VALIDATION_ARRAY);

			if (!Array.isArray(hooks)) {
				throw 'post validation hook isArray() check failed';
			}

			//authenticate the hooks
			const bearer = jwt.sign({ type: 'hook authentication' }, process.env.SECRET_ACCESS, { expiresIn: '5m', issuer: 'auth' });

			//promise for each given hook
			const promises = hooks.map(async hook => {
				if (typeof hook != 'string') {
					throw 'hook is not a string';
				}

				const probe = await fetch(`${hook}?accountIndex=${account.index}`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${bearer}`
					}
				});

				if (!probe.ok) {
					throw `Could not probe the post validation hook: ${hook} with accountIndex = ${account.index}`;
				}

				//discard the result
			});

			await Promise.all(promises);
		}
		catch(e) {
			console.error('HOOK_POST_VALIDATION_ARRAY is not a valid array of strings in JSON format: ' + e);
		}
	}
};

module.exports = route;