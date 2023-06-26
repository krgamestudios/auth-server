const Sequelize = require('sequelize');
const sequelize = require('..');

//DOCS: this isn't set by anything - it's a stub for now

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
