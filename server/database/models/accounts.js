const Sequelize = require('sequelize');
const sequelize = require('..');

module.exports = sequelize.define('accounts', {
	id: {
		type: Sequelize.INTEGER(11),
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		unique: true
	},

	email: {
		type: 'varchar(320)',
		unique: true
	},

	username: {
		type: 'varchar(320)',
		unique: true
	},

	hash: 'varchar(100)', //for passwords

	type: {
		type: Sequelize.ENUM,
		values: ['normal', 'alpha', 'beta', 'gamma'],
		defaultValue: 'normal'
	},

	admin: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},

	mod: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},

	contact: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},

	deletion: {
		type: 'DATETIME',
		allowNull: true,
		defaultValue: null
	}
});
