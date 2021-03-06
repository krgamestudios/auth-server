const jwt = require('jsonwebtoken');
const { tokens } = require('../database/models');

//generates a JWT token based on the given arguments
module.exports = (username, privilege) => {
	const content = {
		username,
		privilege
	};

	const accessToken = jwt.sign(content, process.env.SECRET_ACCESS, { expiresIn: '1m' });
	const refreshToken = jwt.sign(content, process.env.SECRET_REFRESH);

	tokens.create({ token: refreshToken });

	return { accessToken, refreshToken };
};