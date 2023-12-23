const jwt = require('jsonwebtoken');

//middleware to decode the JWT token
module.exports = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const accessToken = authHeader?.split(' ')[1]; //'Bearer token'

	if (!accessToken) {
		return res.status(401).send('No access token provided');
	}

	const decoded = jwt.decode(accessToken);

	req.user = decoded.payload;

	return next();
};