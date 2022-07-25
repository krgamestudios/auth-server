const jwt = require('jsonwebtoken');

const tokenRefresh = require('../utilities/token-refresh');

//auth/token
module.exports = async (req, res) => {
	console.log(req.cookies);

	return tokenRefresh(req.cookies.refreshToken || '', (err, accessToken, refreshToken) => {
		if (err) {
			return res.status(err).end();
		}

		//set the cookie
		res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 60 * 60 * 24 * 30 }); //30 days

		return res.status(200).send(accessToken);
	});
};