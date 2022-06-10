describe('token-auth', () => {
	beforeEach(() => {
		jest.resetModules();

		//mock out jsonwebtoken
		jest.doMock('jsonwebtoken', () => ({
			verify: (token, secretAccess, callback) => {
				if (token != 'invalid') {
					expect(token).toBe('testtoken');
					return callback(null, { username: 'username' });
				} else {
					expect(token).toBe('invalid');
					return callback('Misc. error');
				}
			},
		}));
	});

	test('Required Functionality', () => {
		const tokenAuth = require('../../server/utilities/token-auth');

		const req = {
			headers: {
				authorization: 'Bearer testtoken'
			}
		};

		const res = {
			status: code => {
				expect(code).toBe(null);
				return msg => { throw msg; };
			}
		};

		tokenAuth(req, res, () => null);

		expect(req.user.username).toBe('username');
	});

	test('Missing Token', () => {
		const tokenAuth = require('../../server/utilities/token-auth');

		const req = {
			headers: {
				//
			}
		};

		const res = {
			status: code => {
				expect(code).toBe(401);
				return {
					send: msg => {
						expect(msg).toBe('No token found');
						return null;
					}
				};
			}
		};

		tokenAuth(req, res, () => null);
	});

	test('Invalid Token', () => {
		const tokenAuth = require('../../server/utilities/token-auth');

		const req = {
			headers: {
				authorization: 'Bearer invalid'
			}
		};

		const res = {
			status: code => {
				expect(code).toBe(403);
				return {
					send: msg => {
						expect(msg).toBe('Misc. error');
						return null;
					}
				};
			}
		};

		tokenAuth(req, res, () => null);
	});
});