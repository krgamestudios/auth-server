const jwt = require('jsonwebtoken');
const { tokens } = require('../database/models');

//generates a JWT token based on the given arguments
module.exports = (index, username, type, admin, mod) => {
	const content = {
		index,
		username,
		type,
		admin,
		mod,
	};

	const accessToken = jwt.sign(content, process.env.SECRET_ACCESS, { expiresIn: '10m' });
	const refreshToken = jwt.sign(content, process.env.SECRET_REFRESH, { expiresIn: '30d' });

	tokens.create({ token: refreshToken, username: username });

	return { accessToken, refreshToken };
};