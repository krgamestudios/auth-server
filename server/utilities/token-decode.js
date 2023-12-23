const jwt = require('jsonwebtoken');

//middleware to decode the JWT token
module.exports = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const accessToken = authHeader?.split(' ')[1]; //'Bearer token'

	if (!accessToken) {
		return res.status(401).send('No access token provided');
	}

	return jwt.decode(accessToken, process.env.SECRET_ACCESS, (err, user) => {
		if (err) {
			return res.status(403).send(err);
		}

		req.user = user;

		return next();
	});
};