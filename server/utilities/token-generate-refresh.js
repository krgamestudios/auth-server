const jwt = require('jsonwebtoken');
const { tokens } = require('../database/models');

//generates a JWT token based on the given arguments
module.exports = (index, email, username, type, admin, mod) => {
	const content = {
		index,
		email,
		username,
		type,
		admin,
		mod,
	};

	//these are strings
	const accessToken = jwt.sign(content, process.env.SECRET_ACCESS, { expiresIn: '10m', issuer: 'auth' });
	const refreshToken = jwt.sign(content, process.env.SECRET_REFRESH, { expiresIn: '30d', issuer: 'auth' });

	tokens.create({ token: refreshToken, email: email });

	return { accessToken, refreshToken };
};