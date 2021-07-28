const jwt = require('jsonwebtoken');

const tokenRefresh = require('../utilities/token-refresh');

//auth/token
module.exports = async (req, res) => {
	const refreshToken = req.body.token;

	return tokenRefresh(refreshToken, (err, token) => {
		if (err) {
			return res.status(err).end();
		}

		return res.status(200).send(token);
	});
};