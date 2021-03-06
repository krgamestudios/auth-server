const jwt = require('jsonwebtoken');
const { tokens } = require('../database/models');

//generates a JWT token based on the given arguments
module.exports = (id, username, privilege) => {
	const content = {
		id,
		username,
		privilege
	};

	const accessToken = jwt.sign(content, process.env.SECRET_ACCESS, { expiresIn: '10m' });
	const refreshToken = jwt.sign(content, process.env.SECRET_REFRESH, { expiresIn: '30d' });

	tokens.create({ token: refreshToken });

	return { accessToken, refreshToken };
};