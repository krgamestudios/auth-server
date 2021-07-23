const Sequelize = require('sequelize');
const sequelize = require('..');

module.exports = sequelize.define('tokens', {
	token: 'varchar(320)',
	username: 'varchar(320)' //TODO: why username?
});
