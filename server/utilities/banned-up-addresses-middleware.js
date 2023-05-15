const { Op } = require("sequelize");
const { bannedIPAddresses } = require('../database/models');

//middleware to manage banned IP addresses
module.exports = async (req, res, next) => {
	const address = req.header('x-forwarded-for') || req.socket.remoteAddress;

	const record = await bannedIPAddresses.findOne({
		where: {
			content: address,

			expiry: {
				[Op.gt]: Date.now()
			}
		}
	});

	if (!!record) {
		return res.status(403).send("IP address banned");
	}

	console.log(`IP      ${address}`);

	return next();
};