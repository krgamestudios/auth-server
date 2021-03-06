const Sequelize = require('sequelize');
const sequelize = require('..');

module.exports = sequelize.define('tokens', {
	token: 'varchar(320)',
});
