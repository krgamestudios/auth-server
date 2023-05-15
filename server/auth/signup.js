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

	//script throttle
	const throttle = await checkThrottle(req.body.email);
	if (throttle) {
		console.warn(`Spam attack detected: ${req.body.email} (${req.body.username})`);
		return res.status(401).send(throttle);
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

	if (typeof body.password != "string") {
		return 'Invalid password';
	}

	if (body.password.length < 8) {
		return 'Password too short';
	}

	return null;
};

const checkThrottle = async (email) => {
	//check email delay
	const prev = await pendingSignups.findOne({
		where: {
			email: email,
		}
	});

	const DateOffset = ( offset ) => { //Thanks, SO!
		return new Date( +new Date + offset );
	}

	if (!!prev && prev.updatedAt > DateOffset( -5000 )) {
		return "An unknown error occurred";
	}

	return null;
}

const registerPendingSignup = async (body, hash, token) => {
	//BUGFIX: delete existing pending signups that clash
	await pendingSignups.destroy({
		where: {
			email: body.email
		}
	});

	await pendingSignups.destroy({
		where: {
			username: body.username
		}
	});

	//record it
	const record = await pendingSignups.create({
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
	const msg =
  `Hello ${username}!\n\n` +
  `Please visit the following link to validate your account: ${addr}\n` +
  (process.env.MAIL_PHYSICAL
    ? `\nYou can contact us directly at our physical mailing address here: ${process.env.MAIL_PHYSICAL}\n`
    : ``);

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

