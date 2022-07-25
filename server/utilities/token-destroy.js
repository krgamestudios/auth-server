const { tokens } = require('../database/models');

module.exports = (refreshToken) => {
	tokens.destroy({
		where: {
			token: refreshToken || ''
		}
	});
}