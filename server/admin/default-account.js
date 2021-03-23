//DOCS: ensure that there is at least one administration account
const bcrypt = require('bcryptjs');
const sequelize = require('../database');
const { accounts } = require('../database/models');

module.exports = async () => {
	await sequelize.sync(); //this whole file is just one big BUGFIX

	//validate env variables
	if (!process.env.ADMIN_DEFAULT_USERNAME || !process.env.ADMIN_DEFAULT_PASSWORD) {
		//skip this if arguments are missing
		return;
	}

	if (process.env.ADMIN_DEFAULT_PASSWORD && process.env.ADMIN_DEFAULT_PASSWORD.length < 8) {
		console.warn('ADMIN_DEFAULT_PASSWORD is too short - skipping default account creation');
		return;
	}

	//check for an existing admin account
	const adminRecord = await accounts.findOne({
		where: {
			admin: true
		}
	});

	if (adminRecord == null) {
		await accounts.create({
			email: `${process.env.ADMIN_DEFAULT_USERNAME}@${process.env.WEB_ADDRESS}`,
			username: `${process.env.ADMIN_DEFAULT_USERNAME}`,
			hash: await bcrypt.hash(`${process.env.ADMIN_DEFAULT_PASSWORD}`, await bcrypt.genSalt(11)),
			type: 'normal',
			admin: true,
			mod: true
		});

		console.warn(`Created default admin account (email: ${process.env.ADMIN_DEFAULT_USERNAME}@${process.env.WEB_ADDRESS}; password: ${process.env.ADMIN_DEFAULT_PASSWORD})`);
	}
};
