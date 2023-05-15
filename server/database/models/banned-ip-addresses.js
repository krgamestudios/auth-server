const Sequelize = require('sequelize');
const sequelize = require('..');

module.exports = sequelize.define('bannedIPAddresses', {
	content: {
		type: 'varchar(320)',
		unique: true
	},

	expiry: {
		type: 'DATETIME',
		allowNull: true,
		defaultValue: null
	},
});
