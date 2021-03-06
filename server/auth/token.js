const jwt = require('jsonwebtoken');

const refresh = require('../utilities/token-refresh');

//auth/token
module.exports = async (req, res) => {
	const refreshToken = req.body.token;

	return refresh(refreshToken, (err, tokens) => {
		if (err) {
			return res.status(err).end();
		}

		return res.status(200).send(tokens);
	});
};