const jwt = require('jsonwebtoken');

//middleware to authenticate the JWT token
module.exports = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader?.split (' ')[1]; //'Bearer token'

	if (!token) {
		return res.status(401).end();
	}

	jwt.verify(token, process.env.SECRET_ACCESS, (err, user) => {
		if (err) {
			return res.status(403).end();
		}

		req.user = user;

		next();
	});
};