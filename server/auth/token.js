const jwt = require('jsonwebtoken');

const tokenRefresh = require('../utilities/token-refresh');

//auth/token
module.exports = async (req, res) => {
	return tokenRefresh(req.cookies.refreshToken || '', (err, accessToken, refreshToken) => {
		if (err) {
			return res.status(err).end();
		}

		//set the cookie
		res.cookie('refreshToken', refreshToken, { path: '/', httpOnly: true, secure: true, sameSite: 'none', maxAge: 60 * 60 * 24 * 30 * 1000 }); //30 days

		return res.status(200).send({ accessToken });
	});
};