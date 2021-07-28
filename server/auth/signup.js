//libraries
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { accounts, pendingSignups } = require('../database/models');

//utilities
const uuid = require('../utilities/uuid');
const validateEmail = require('../utilities/validate-email');
const validateUsername = require('../utilities/validate-username');

//auth/signup
const route = async (req, res) => {
	//validate the given details
	const validateErr = await validateDetails(req.body);
	if (validateErr) {
		return res.status(401).send(validateErr);
	}

	//generate the password hash
	const hash = await bcrypt.hash(req.body.password, await bcrypt.genSalt(11));

	//generate the validation field
	const token = uuid();

	//register signup
	const signupErr = await registerPendingSignup(req.body, hash, token);
	if (signupErr) {
		return res.status(500).send(signupErr);
	}

	//send the validation email
	const emailErr = await sendValidationEmail(req.body.email, req.body.username, token);
	if (emailErr) {
		return res.status(500).send(emailErr);
	}

	//finally
	res.status(200).send("Validation email sent!");
	return null;
}

const validateDetails = async (body) => {
	//basic formatting
	if (!validateEmail(body.email)) {
		return 'Invalid email';
	}

	if (!validateUsername(body.username)) {
		return 'Invalid username';
	}

	//check for existing (banned)
	//TODO: re-add banned email checks

	//check for existing email
	const emailRecord = await accounts.findOne({
		where: {
			email: body.email
		}
	});

	if (emailRecord) {
		return 'Email already exists';
	}

	if (!body.username) {
		return 'Missing username';
	}

	//check for existing username
	const usernameRecord = await accounts.findOne({
		where: {
			username: body.username
		}
	});

	if (usernameRecord) {
		return 'Username already exists';
	}

	//validate password
	if (!body.password) {
		return 'Missing password';
	}

	if (body.password.length < 8) {
		return 'Password too short';
	}

	return null;
};

const registerPendingSignup = async (body, hash, token) => {
	const record = await pendingSignups.upsert({
		email: body.email,
		username: body.username,
		hash: hash,
		contact: body.contact,
		token: token
	});

	return null;
};

const sendValidationEmail = async (email, username, token) => {
	const addr = `${process.env.WEB_PROTOCOL}://${process.env.WEB_ADDRESS}/auth/validation?username=${username}&token=${token}`;
	const msg = `Hello ${username}!

Please visit the following link to validate your account: ${addr}

You can contact us directly at our physical mailing address here: ${process.env.MAIL_PHYSICAL}
`;

	let transporter, info;

	//what exactly is a transport?
	try {
		transporter = nodemailer.createTransport({
			host: process.env.MAIL_SMTP,
			port: 465,
			secure: true,
			auth: {
			  user: process.env.MAIL_USERNAME,
			  pass: process.env.MAIL_PASSWORD
			},
		});
	}
	catch(e) {
		return `failed to create a mail transport: ${e}`;
	}

	// send mail with defined transport object
	try {
		info = await transporter.sendMail({
			from: `signup@${process.env.WEB_ADDRESS}`, //WARNING: google overwrites this
			to: email,
			subject: 'Email Validation',
			text: msg
		});
	}
	catch(e) {
		return `failed to send validation mail: ${e}`;
	}

	if (info.accepted[0] != email) {
		return 'validation email failed to send';
	}

	return null;
};

module.exports = route;

