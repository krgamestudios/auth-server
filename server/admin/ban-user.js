const { accounts, tokens } = require('../database/models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//admin/banuser
const route = async (req, res) => {
	const updated = await accounts.update({
		banned: true
	}, {
		where: {
			username: {
				[Op.eq]: req.body.username || ''
			},
			admin: {
				[Op.not]: true
			},
			mod: {
				[Op.not]: true
			}
		}
	});

	if (!updated[0]) {
		return res.status(500).send('Failed to set banned status');
	}

	//forcibly logout
	tokens.destroy({
		where: {
			username: req.body.username || ''
		}
	});

	res.status(200).end();
};

module.exports = route;