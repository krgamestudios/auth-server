const { tokens } = require('../database/models');

module.exports = async (refreshToken) => {
	await tokens.destroy({
		where: {
			token: refreshToken || ''
		}
	});
}