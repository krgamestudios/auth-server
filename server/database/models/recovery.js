const sequelize = require('..');

module.exports = sequelize.define('recovery', {
	token: 'varchar(320)',
	email: 'varchar(320)'
});
