//libraries
const utils = require('util');
const bcrypt = require('bcryptjs');
var cron = require('node-cron');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { accounts } = require('../database/models');

//auth/deletion
const route = async (req, res) => {
	const account = await accounts.findOne({
		where: {
			index: req.user.index
		}
	});

	//compare the user's password
	const compare = utils.promisify(bcrypt.compare);
	const match = await compare(req.body.password || '', account.hash);

	if (!match) {
		return res.status(401).send('incorrect password');
	}

	//set the deletion time (2 days from now)
	const interval = new Date(new Date().setDate(new Date().getDate() + 2)); //wow
	await accounts.update({
		deletion: interval
	},
	{
		where: {
			index: req.user.index
		}
	});

	//finally
	return res.status(200).end();
};

//actually delete the accounts
cron.schedule('0 * * * *', async () => {
	await accounts.destroy({
		where: {
			deletion: {
				[Op.lt]: Sequelize.fn('NOW')
			}
		}
	});
});

module.exports = route;