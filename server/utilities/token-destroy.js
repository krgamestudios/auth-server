const { tokens } = require('../database/models');

module.exports = (token) => {
	tokens.destroy({
		where: {
			token: token || ''
		}
	});
}