const jwt = require('jsonwebtoken');
const { tokens } = require('../database/models');

const generate = require('./token-generate');
const destroy = require('./token-destroy');

module.exports = async (token, callback) => {
	if (!token) {
		return callback(401);
	}

	const tokenRecord = await tokens.findOne({
		where: {
			token: token || ''
		}
	});

	if (!tokenRecord) {
		return callback(403);
	}

	jwt.verify(token, process.env.SECRET_REFRESH, (err, user) => {
		if (err) {
			return callback(403);
		}

		const result = generate(user.index, user.email, user.username, user.type, user.admin, user.mod);

		destroy(token);

		return callback(null, result);
	});
};