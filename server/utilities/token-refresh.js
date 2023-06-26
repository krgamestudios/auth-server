const jwt = require('jsonwebtoken');
const { tokens } = require('../database/models');

const generate = require('./token-generate-refresh');
const destroy = require('./token-destroy');

module.exports = async (oldRefreshToken, callback) => {
	if (!oldRefreshToken) {
		return callback(401);
	}

	const tokenRecord = await tokens.findOne({
		where: {
			token: oldRefreshToken || ''
		}
	});

	if (!tokenRecord) {
		return callback(403);
	}

	jwt.verify(oldRefreshToken, process.env.SECRET_REFRESH, async (err, user) => {
		if (err) {
			return callback(403);
		}

		await destroy(oldRefreshToken);

		const { accessToken, refreshToken } = await generate(user.index, user.email, user.username, user.type, user.admin, user.mod);

		return await callback(null, accessToken, refreshToken);
	});
};