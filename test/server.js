var assert = require('assert')
var request = require('supertest')

var app
var db

before(async function () {
	var { Client } = require('pg')
	var client = new Client('postgresql://ctf@localhost/template1')

	await client.connect()
	await client.query('DROP DATABASE IF EXISTS ctfjstesting')
	await client.query('CREATE DATABASE ctfjstesting')
	await client.end()
	process.env.PORT = 9225
	process.env.DATABASE_URI = 'postgresql://ctf@localhost/ctfjstesting'
	process.env.SECRET_KEY = 'secret_for_testing_only'
	
	await require('../db').init(process.env.DATABASE_URI)
	db = require('../db').db
	app = require('../index.js')
})

describe('Server Tests', function () {

	var adminAuth = ''
	var userAuth = {}

	describe('Admin', function () {
		describe('POST /admin', function () {
			it('201 | creates an admin', function (done) {
				request(app)
					.post('/admin')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc')
					.send({
						'email': '  email@email.email  ',
						'username': ' admin   ',
						'password': 'admin123',
						'_csrf': 'abc'
					})
					.expect(201, done)
			})
			it('403 | doesn\'t allow creation of an admin', function (done) {
				request(app)
					.post('/admin')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc')
					.send({
						'email': 'email2@email.email',
						'username': 'admin',
						'password': 'admin123',
						'_csrf': 'abc'
					})
					.expect(403)
					.expect({message: 'action_forbidden'}, done)
			})
		})
		describe('GET /admin', function () {
			it('200 | returns the created admin with trimmed email and username', function (done) {
				request(app)
					.get('/admin')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect('Content-Type', /json/)
					.expect(200)
					.then(response => {
						assert.strictEqual(response.body.length, 1)
						assert.strictEqual(response.body[0].id, 1)
						assert.strictEqual(response.body[0].username, 'admin')
						assert.strictEqual(response.body[0].eligible, false)
						assert.strictEqual(typeof response.body[0].created, 'string')
						assert.deepStrictEqual(Object.keys(response.body[0]), ['id', 'username', 'eligible', 'created'])
						done()
					}).catch(function (error) {
						done(error)
					})
			})
		})
		describe('POST /admin/auth', function () {
			it('200 | gets an authentication token', function (done) {
				request(app)
					.post('/admin/auth')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc')
					.send({
						'username': 'admin',
						'password': 'admin123',
						'_csrf': 'abc'
					})
					.expect(200)
					.then(function (response) {
						assert.strictEqual(typeof response.body.token, 'string')
						assert.strictEqual(Object.keys(response.body).length, 1)
						adminAuth = response.body.token
						request(app)
							.post('/admin')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.set('cookie', '_csrf=abc; token=' + adminAuth)
							.send({
								_csrf: 'abc',
								username: 'admin',
								email: 'test163@test.test',
								password: 'test1234',
								eligible: false
							})
							.expect(409)
							.expect({message: 'username_email_conflict'}, done)
					}).catch(function (error) {
						done(error)
					})
			})
		})
	})

	describe('Competitions', function () {
		describe('POST /competitions', function () {
			it('201 | creates competitions', function (done) {
				request(app)
					.post('/competitions')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						_csrf: 'abc',
						name: 'testing',
						about: 'for testing',
						teamSize: 3,
						start: new Date() .toISOString(),
						end: new Date(new Date() + 500000) .toISOString()
					})
					.expect(201)
					.then(function (response) {
						request(app)
							.post('/competitions')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.set('cookie', '_csrf=abc; token=' + adminAuth)
							.send({
								_csrf: 'abc',
								name: 'testing',
								about: 'for testing',
								teamSize: 2,
								start: new Date() .toISOString(),
								end: new Date(+new Date() + 50000) .toISOString()
							})
							.expect(201, done)
					}).catch(function (error) {
						done(error)
					})
			})
			it('403 | does not allow non-admin to create competition (creates a user and auth token)', function (done) {
				request(app)
					.post('/competitions/2/users')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc')
					.send({
						_csrf: 'abc',
						username: 'test',
						email: 'test@test.test',
						password: 'test1234',
						eligible: false
					})
					.expect(201)
					.then(function () {
						request(app)
							.post('/competitions/2/auth')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.set('cookie', '_csrf=abc')
							.send({
								_csrf: 'abc',
								username: 'test',
								password: 'test1234'
							})
							.expect(200)
							.then(function (response) {
								assert.strictEqual(typeof response.body.token, 'string')
								userAuth[3] = response.body.token
								request(app)
									.post('/competitions')
									.set('referer', 'https://angstromctf.com')
									.set('host', 'angstromctf.com')
									.set('cookie', '_csrf=abc; token=' + userAuth[3])
									.send({
										_csrf: 'abc',
										name: 'testing',
										about: 'for testing',
										teamSize: 3,
										start: new Date() .toISOString(),
										end: new Date(new Date() + 500000) .toISOString()
									})
									.expect(403)
									.expect({message: 'action_forbidden'}, done)
							}).catch(function (error) {
								done(error)
							})
					}).catch(function (error) {
						done(error)
					})
			})
		})
		describe('GET /competitions', function (done) {
			it('200 | gets all competitions', function (done) {
				request(app)
					.get('/competitions')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect('Content-Type', /json/)
					.expect(200)
					.then(response => {
						assert.strictEqual(response.body.length, 2)
						assert.strictEqual(response.body[0].id, 1)
						assert.strictEqual(response.body[0].name, 'testing')
						assert.strictEqual(response.body[0].about, 'for testing')
						assert.strictEqual(response.body[0].teamSize, 3)
						assert.strictEqual(typeof response.body[0].created, 'string')
						assert.strictEqual(typeof response.body[0].start, 'string')
						assert.strictEqual(typeof response.body[0].end, 'string')
						done()
					}).catch(function (error) {
						done(error)
					})
			})
		})
		describe('PATCH /competitions/{id}', function () {
			it('204 | modifies a competition', function (done) {
				request(app)
					.patch('/competitions/1')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						_csrf: 'abc',
						about: 'this is for testing!!!',
						name: 'testing2',
						teamSize: 2
					})
					.expect(204)
					.then(function () {
						request(app)
							.patch('/competitions/1')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.set('cookie', '_csrf=abc; token=' + adminAuth)
							.send({
								_csrf: 'abc',
								about: 'this is for testing'
							})
							.expect(204, done)
					}).catch(function (error) {
						done(error)
					})
			})
			it('403 | does not allow modification if not admin', function (done) {
				request(app)
					.patch('/competitions/1')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.send({
						_csrf: 'abc',
						about: 'this is for testing',
						name: 'testing2',
						teamSize: 2
					})
					.expect(403)
					.expect({message: 'action_forbidden'}, done)
			})
		})
		describe('GET /competitions/{id}', function () {
			it('200 | gets a single competition and see modifications', function (done) {
				request(app)
					.get('/competitions/1')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect('Content-Type', /json/)
					.expect(200)
					.then(response => {
						assert.strictEqual(response.body.id, 1)
						assert.strictEqual(response.body.name, 'testing2')
						assert.strictEqual(response.body.about, 'this is for testing')
						assert.strictEqual(response.body.teamSize, 2)
						assert.strictEqual(typeof response.body.created, 'string')
						assert.strictEqual(typeof response.body.start, 'string')
						assert.strictEqual(typeof response.body.end, 'string')		
						assert.strictEqual(Object.keys(response.body).length, 7)		
						done()
					}).catch(function (error) {
						done(error)
					})
			})
			it('404 | returns 404 when getting nonexistent competition', function (done) {
				request(app)
					.get('/competitions/3')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect(404, done)
			})
		})
		describe('DELETE /competitions/{id}', function () {
			it('204 | deletes a competition', function (done) {
				request(app)
					.delete('/competitions/1')
					.query({ _csrf: 'abc' })
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.expect(204, done)
			})
			it('403 | does not allow non-admin to delete', function (done) {
				request(app)
					.delete('/competitions/1')
					.query({ _csrf: 'abc' })
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.expect(403)
					.expect({message: 'action_forbidden'}, done)
			})
		})
		describe('GET /competitions', function () {
			it('200 | sees one competition', function (done) {
				request(app)
					.get('/competitions')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect(200)
					.then(function (response) {
						assert.strictEqual(response.body.length, 1)
						done()
					}).catch(function (error) {
						done(error)
					})
			})
		})
	})

	describe('Users', function () {
		describe('POST /competitions/{id}/users', function () {
			it('201 | creates users', function (done) {
				request(app)
					.post('/competitions/2/users')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc')
					.send({
						_csrf: 'abc',
						username: ' test2 	 ',
						email: '    test2@test.test 	',
						password: 'test1234',
						eligible: true
					})
					.expect(201)
					.then(function () {
						request(app)
							.post('/competitions/2/users')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.set('cookie', '_csrf=abc')
							.send({
								_csrf: 'abc',
								username: 'test3',
								email: 'test3@test.test',
								password: 'test1234',
								eligible: true
							})
							.expect(201)
							.then(function () {
								request(app)
									.post('/competitions/2/users')
									.set('referer', 'https://angstromctf.com')
									.set('host', 'angstromctf.com')
									.set('cookie', '_csrf=abc')
									.send({
										_csrf: 'abc',
										username: 'test4',
										email: 'test4@test.test',
										password: 'test1234',
										eligible: true
									})
									.expect(201, done)
							}).catch(function (error) {
								done(error)
							})
					}).catch(function (error) {
						done(error)
					})
			})
		})
		describe('GET /users', function () {
			it('200 | gets all users', function (done) {
				request(app)
					.get('/competitions/2/users')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect(200)
					.then(function (response) {
						assert.strictEqual(response.body.length, 4)
						assert.strictEqual(response.body[0].id, 3)
						assert.strictEqual(response.body[0].username, 'test')
						assert.strictEqual(response.body[0].eligible, false)
						assert.strictEqual(typeof response.body[0].created, 'string')
						assert.strictEqual(Object.keys(response.body[0]).length, 4)
						done()
					}).catch(function (error) {
						done(error)
					})
			})
		})
		describe('POST /competitions/{id}/auth', function () {
			it('200 | gets authentication tokens with trimmed username and email', function (done) {
				request(app)
					.post('/competitions/2/auth')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc')
					.send({
						_csrf: 'abc',
						username: 'test2',
						password: 'test1234'
					})
					.expect(200)
					.then(function (response) {
						assert.strictEqual(typeof response.body.token, 'string')
						userAuth[5] = response.body.token
						request(app)
							.post('/competitions/2/auth')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.set('cookie', '_csrf=abc')
							.send({
								_csrf: 'abc',
								username: 'test3',
								password: 'test1234'
							})
							.expect(200)
							.then(function (response) {
								assert.strictEqual(typeof response.body.token, 'string')
								userAuth[6] = response.body.token
								request(app)
									.post('/competitions/2/auth')
									.set('referer', 'https://angstromctf.com')
									.set('host', 'angstromctf.com')
									.set('cookie', '_csrf=abc')
									.send({
										_csrf: 'abc',
										username: 'test4',
										password: 'test1234'
									})
									.expect(200)
									.then(function (response) {
										assert.strictEqual(typeof response.body.token, 'string')
										userAuth[7] = response.body.token
										done()
									}).catch(function (error) {
										done(error)
									})
							}).catch(function (error) {
								done(error)
							})
					}).catch(function (error) {
						done(error)
					})
			})
		})
		describe('PATCH /competitions/{id}/users/{id}', function () {
			it('204 | modifies a user as admin', function (done) {
				request(app)
					.patch('/competitions/2/users/3')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						_csrf: 'abc',
						email: 'test6@test1.test1',
						eligible: true
					})
					.expect(204, done)
			})
			it('204 | modifies the user with their own auth token', function (done) {
				request(app)
					.patch('/competitions/2/users/3')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.send({
						_csrf: 'abc',
						username: 'test1',
						email: 'test1@test.test',
						eligible: true
					})
					.expect(204, done)
			})
			it('403 | cannot modify if not admin or self', function (done) {
				request(app)
					.patch('/competitions/2/users/3')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[5])
					.send({
						_csrf: 'abc',
						username: 'test1',
						email: 'test1@test.test',
						eligible: true
					})
					.expect(403)
					.expect({message: 'action_forbidden'}, done)
			})
			it('404 | cannot modify nonexistent user', function (done) {
				request(app)
					.patch('/competitions/2/users/8')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						_csrf: 'abc',
						username: 'test1',
						email: 'test1@test.test',
						eligible: true
					})
					.expect(404)
					.expect({message: 'user_not_found'}, done)
			})
			it('409 | cannot create conflicting username', function (done) {
				request(app)
					.patch('/competitions/2/users/5')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						_csrf: 'abc',
						username: 'test1',
						email: 'test165487@test.test',
						eligible: true
					})
					.expect(409)
					.expect({message: 'username_email_conflict'}, done)
			})
			it('409 | cannot create conflicting email', function (done) {
				request(app)
					.patch('/competitions/2/users/5')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						_csrf: 'abc',
						username: 'test1643745',
						email: 'test1@test.test',
						eligible: true
					})
					.expect(409)
					.expect({message: 'username_email_conflict'}, done)
			})
		})
		describe('GET /competitions/{id}/users/{id}', function () {
			it('200 | gets the modified user', function (done) {
				request(app)
					.get('/competitions/2/users/3')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect(200)
					.then(function (response) {
						assert.strictEqual(response.body.id, 3)
						assert.strictEqual(response.body.username, 'test1')
						assert.strictEqual(response.body.eligible, true)
						assert.strictEqual(typeof response.body.created, 'string')
						assert.strictEqual(Object.keys(response.body).length, 4)
						done()
					}).catch(function (error) {
						done(error)
					})
			})
			it('404 | returns 404 when getting nonexistent user', function (done) {
				request(app)
					.get('/competitions/2/users/1')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect(404)
					.expect({message: "user_not_found"}, done)
			})
		})
	})

	describe('User/Admin Conflicts', function () {
		describe('POST /competitions/{id}/users', function () {
			it('409 | returns conflict for username', function (done) {
				request(app)
					.post('/competitions/2/users')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc')
					.send({
						_csrf: 'abc',
						username: 'test1',
						email: 'test163@test.test',
						password: 'test1234',
						eligible: false
					})
					.expect(409)
					.expect({message: 'username_email_conflict'}, done)
			})
			it('409 | returns conflict for email', function (done) {
				request(app)
					.post('/competitions/2/users')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc')
					.send({
						_csrf: 'abc',
						username: 'test163',
						email: 'test1@test.test',
						password: 'test1234',
						eligible: false
					})
					.expect(409)
					.expect({message: 'username_email_conflict'}, done)
			})
		})
		describe('POST /admin', function () {
			it('409 | returns conflict for username', function (done) {
				request(app)
					.post('/admin')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						'email': 'email2@email.email',
						'username': 'admin',
						'password': 'admin123',
						'_csrf': 'abc'
					})
					.expect(409)
					.expect({message: "username_email_conflict"}, done)
			})
			it('409 | returns conflict for email', function (done) {
				request(app)
					.post('/admin')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						'email': 'email@email.email',
						'username': 'admin2',
						'password': 'admin123',
						'_csrf': 'abc'
					})
					.expect(409)
					.expect({message: "username_email_conflict"}, done)
			})
		})
	})

	describe('Teams', function () {
		describe('POST /competitions/{id}/teams', function () {
			it('201 | creates and joins a team', function (done) {
				request(app)
					.post('/competitions/2/teams')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.send({
						name: '   team1 			  ',
						affiliation: 'testing team 1',
						passcode: 'team1team1',
						_csrf: 'abc'
					})
					.expect(201, done)
			})
			it('201 | creates and joins a new team', function (done) {
				request(app)
					.post('/competitions/2/teams')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[6])
					.send({
						name: 'team2',
						affiliation: 'testing team 2',
						passcode: 'team2team2',
						_csrf: 'abc'
					})
					.expect(201, done)
			})
			it('403 | cannot create and switch team after competition has started', function (done) {
				request(app)
					.post('/competitions/2/teams')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.send({
						name: 'team3',
						affiliation: 'testing team 3',
						passcode: 'team3team3',
						_csrf: 'abc'
					})
					.expect(403)
					.expect({message: 'user_already_has_team'}, done)
			})
			it('201 | can create and switch team before competition has started', function (done) {
				request(app)
					.patch('/competitions/2')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						_csrf: 'abc',
						start: new Date(+new Date() + 500000) .toISOString()
					})
					.expect(204)
					.then(function () {
						request(app)
							.post('/competitions/2/teams')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.set('cookie', '_csrf=abc; token=' + userAuth[3])
							.send({
								name: 'team3',
								affiliation: 'testing team 3',
								passcode: 'team3team3',
								_csrf: 'abc'
							})
							.expect(201)
							.then(function (response) {
								request(app)
									.patch('/competitions/2')
									.set('referer', 'https://angstromctf.com')
									.set('host', 'angstromctf.com')
									.set('cookie', '_csrf=abc; token=' + adminAuth)
									.send({
										_csrf: 'abc',
										start: new Date() .toISOString()
									})
									.expect(204, done)
							}).catch(function (error) {
								done(error)
							})
					}).catch(function (error) {
						done(error)
					})
			})
			it('409 | returns 409 for team name conflict when creating', function (done) {
				request(app)
					.post('/competitions/2/teams')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[7])
					.send({
						name: 'team3',
						affiliation: 'testing team 3',
						passcode: 'team3team3',
						_csrf: 'abc'
					})
					.expect(409)
					.expect({message: "team_name_conflict"}, done)
			})
		})
		describe('PATCH /competitions/{id}/teams', function () {
			it('204 | joins a team', function (done) {
				request(app)
					.patch('/competitions/2/teams')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[5])
					.send({
						name: 'team3',
						passcode: 'team3team3',
						_csrf: 'abc'
					})
					.expect(204, done)
			})
			it('403 | cannot join full team', function (done) {
				request(app)
					.patch('/competitions/2/teams')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[7])
					.send({
						name: 'team3',
						passcode: 'team3team3',
						_csrf: 'abc'
					})
					.expect(403)
					.expect({message: 'team_is_full'}, done)
			})
			it('403 | can\'t join a team user is already on', function (done) {
				request(app)
					.patch('/competitions/2/teams')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[5])
					.send({
						name: 'team3',
						passcode: 'team3team3',
						_csrf: 'abc'
					})
					.expect(403)
					.expect({message: 'already_in_team'}, done)
			})
			it('403 | cannot switch teams after competition has started', function (done) {
				request(app)
					.patch('/competitions/2/teams')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[5])
					.send({
						name: 'team2',
						passcode: 'team2team2',
						_csrf: 'abc'
					})
					.expect(403)
					.expect({message: 'user_already_has_team'}, done)
			})
			it('204 | can switch teams before competition has started', function (done) {
				request(app)
					.patch('/competitions/2')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						_csrf: 'abc',
						start: new Date(+new Date() + 500000) .toISOString()
					})
					.expect(204)
					.then(function () {
						request(app)
							.patch('/competitions/2/teams')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.set('cookie', '_csrf=abc; token=' + userAuth[5])
							.send({
								name: 'team2',
								passcode: 'team2team2',
								_csrf: 'abc'
							})
							.expect(204)
							.then(function (response) {
								request(app)
									.patch('/competitions/2')
									.set('referer', 'https://angstromctf.com')
									.set('host', 'angstromctf.com')
									.set('cookie', '_csrf=abc; token=' + adminAuth)
									.send({
										_csrf: 'abc',
										start: new Date() .toISOString()
									})
									.expect(204, done)
							}).catch(function (error) {
								done(error)
							})
				}).catch(function (error) {
					done(error)
				})
			})
		})
		describe('GET /competitions/{id}/teams', function () {
			it('200 | gets a list of teams with trimmed team name', function (done) {
				request(app)
					.get('/competitions/2/teams')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect(200)
					.then(function (response) {
						assert.strictEqual(response.body.length, 3)
						assert.strictEqual(response.body[0].id, 1)
						assert.strictEqual(response.body[0].name, 'team1')
						assert.strictEqual(response.body[0].affiliation, 'testing team 1')
						assert.strictEqual(response.body[0].score, 0)
						assert.strictEqual(response.body[0].lastSolve, undefined)
						assert.strictEqual(response.body[0].eligible, false)
						assert.strictEqual(response.body[2].eligible, true)
						assert.strictEqual(typeof response.body[0].created, 'string')
						assert.strictEqual(Object.keys(response.body[0]).length, 6)
						done()
					}).catch(function (error) {
						done(error)
					})
			})
		})
		describe('GET /competitions/{id}/teams/{id}', function () {
			it('200 | gets a team', function (done) {
				request(app)
					.get('/competitions/2/teams/2')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect(200)
					.then(function (response) {
						assert.strictEqual(response.body.id, 2)
						assert.strictEqual(response.body.name, 'team2')
						assert.strictEqual(response.body.affiliation, 'testing team 2')
						assert.strictEqual(response.body.eligible, true)
						assert.strictEqual(typeof response.body.created, 'string')
						assert.deepStrictEqual(response.body.solves, [])
						assert.strictEqual(response.body.members.length, 2)
						assert.strictEqual(Object.keys(response.body).length, 7)
						assert.strictEqual(response.body.members[0].id, 5)
						assert.strictEqual(response.body.members[0].username, 'test3')
						assert.strictEqual(response.body.members[0].eligible, true)
						assert.strictEqual(typeof response.body.created, 'string')
						assert.strictEqual(Object.keys(response.body.members[0]).length, 4)
						done()
					}).catch(function (error) {
						done(error)
					})
			})
			it('404 | returns 404 for nonexistent team', function (done) {
				request(app)
					.get('/competitions/2/teams/4')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect(404, done)
			})
		})
		describe('PATCH /competitions/{id}/teams/{id}', function () {
			it('204 | modifies a team when admin', function (done) {
				request(app)
					.patch('/competitions/2/teams/3')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						_csrf: 'abc',
						name: 'edited name'
					})
					.expect(204)
					.then(function () {
						request(app)
							.get('/competitions/2/teams/3')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.expect(200)
							.then(function (response) {
								assert.strictEqual(response.body.name, 'edited name')
								done()
							}).catch(function (error) {
								done(error)
							})
					}).catch(function (error) {
						done(error)
					})
			})
			it('204 | modifies a team when member', function (done) {
				request(app)
					.patch('/competitions/2/teams/3')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.send({
						_csrf: 'abc',
						affiliation: 'edited affiliation'
					})
					.expect(204)
					.then(function () {
						request(app)
							.get('/competitions/2/teams/3')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.expect(200)
							.then(function (response) {
								assert.strictEqual(response.body.affiliation, 'edited affiliation')
								done()
							}).catch(function (error) {
								done(error)
							})
					}).catch(function (error) {
						done(error)
					})
			})
			it('404 | returns 404 when modifying nonexistent team', function (done) {
				request(app)
					.patch('/competitions/2/teams/6')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						_csrf: 'abc',
						affiliation: 'edited affiliation'
					})
					.expect(404)
					.expect({message: 'team_not_found'}, done)
			})
			it('403 | does not allow non-member to modify team', function (done) {
				request(app)
					.patch('/competitions/2/teams/3')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[6])
					.send({
						_csrf: 'abc',
						affiliation: 'edited affiliation'
					})
					.expect(403)
					.expect({message: 'action_forbidden'}, done)
			})
			it('409 | returns 409 when modifying to conflicting team name', function (done) {
				request(app)
					.patch('/competitions/2/teams/3')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.send({
						_csrf: 'abc',
						name: 'team2'
					})
					.expect(409)
					.expect({message: 'team_name_conflict'}, done)
			})
		})
	})

	describe('Challenges', function () {
		describe('POST /competitions/{id}/challenges', function () {
			it('201 | creates challenges', function (done) {
				request(app)
					.post('/competitions/2/challenges')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						_csrf: 'abc',
						title: 'test title',
						description: 'test description',
						value: 1,
						author: 'test author',
						flag: 'test flag',
						category: 'test category'
					})
					.expect(201)
					.then(function () {
						return request(app)
							.post('/competitions/2/challenges')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.set('cookie', '_csrf=abc; token=' + adminAuth)
							.send({
								_csrf: 'abc',
								title: 'test title 2',
								description: 'test description',
								value: 1,
								author: 'test author',
								flag: 'test flag',
								category: 'test category'
							})
							.expect(201)
					})
					.then(function () {
						request(app)
							.post('/competitions/2/challenges')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.set('cookie', '_csrf=abc; token=' + adminAuth)
							.send({
								_csrf: 'abc',
								title: 'test title 3',
								description: 'test description',
								value: 1,
								author: 'test author',
								flag: 'test flag',
								category: 'test category'
							})
							.expect(201, done)
					})
			})
			it('403 | cannot create a challenge if not admin', function (done) {
				request(app)
					.post('/competitions/2/challenges')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.send({
						_csrf: 'abc',
						title: 'test title',
						description: 'test description',
						value: 1,
						author: 'test author',
						flag: 'test flag',
						category: 'test category'
					})
					.expect(403, done)
			})
		})
		describe('GET /competitions/{id}/challenges', function () {
			it('200 | gets a list of challenges', function (done) {
				request(app)
					.get('/competitions/2/challenges')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect(200)
					.then(function (response) {
						assert.strictEqual(response.body.length, 3)
						assert.strictEqual(Object.keys(response.body[0]).length, 7)
						assert.strictEqual(response.body[0].id, 1)
						assert.strictEqual(response.body[0].value, 1)
						assert.strictEqual(response.body[0].title, 'test title')
						assert.strictEqual(response.body[0].description, 'test description')
						assert.strictEqual(response.body[0].author, 'test author')
						assert.strictEqual(response.body[0].category, 'test category')
						assert.strictEqual(response.body[0].solves, 0)
						done()
					}).catch(function (error) {
						done(error)
					})
			})
		})
		describe('PATCH /competitions/{id}/challenges/{id}', function () {
			it('204 | modifies a challenge', function (done) {
				request(app)
					.patch('/competitions/2/challenges/1')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.send({
						_csrf: 'abc',
						title: 'test title 2!',
						description: 'test description 2',
						value: 2,
						author: 'test author 2',
						flag: 'test flag 2',
						category: 'test category 2'
					})
					.expect(204)
					.then(function () {
						request(app)
							.patch('/competitions/2/challenges/1')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.set('cookie', '_csrf=abc; token=' + adminAuth)
							.send({
								_csrf: 'abc',
								title: 'test title 2'
							})
							.expect(204, done)
					}).catch(function (error) {
						done(error)
					})
			})
			it('403 | does not allow modification when not admin', function (done) {
				request(app)
					.patch('/competitions/2/challenges/1')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.send({
						_csrf: 'abc',
						title: 'test title 2',
						description: 'test description 2',
						value: 2,
						author: 'test author 2',
						flag: 'test flag 2',
						category: 'test category 2'
					})
					.expect(403, done)
			})
		})
		describe('POST /competitions/{id}/challenges/{id}/submissions', function () {
			it('200 | returns false for a wrong flag', function (done) {
				request(app)
					.post('/competitions/2/challenges/1/submissions')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.send({
						_csrf: 'abc',
						flag: 'lsdjaflksajf'
					})
					.expect(200)
					.expect({correct: false}, done)
			})
			it('200 | returns true for a correct flag', function (done) {
				request(app)
					.post('/competitions/2/challenges/1/submissions')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.send({
						_csrf: 'abc',
						flag: 'test flag 2'
					})
					.expect(200)
					.expect({correct: true})
					.then(function () {
						request(app)
							.post('/competitions/2/challenges/2/submissions')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.set('cookie', '_csrf=abc; token=' + userAuth[5])
							.send({
								_csrf: 'abc',
								flag: 'test flag'
							})
							.expect(200)
							.expect({correct: true}, done)
					})
			})
			it('404 | returns not found if challenge doesn\'t exist', function (done) {
				request(app)
					.post('/competitions/2/challenges/5/submissions')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.send({
						_csrf: 'abc',
						flag: 'test flag 2'
					})
					.expect(404)
					.expect({message: 'challenge_not_found'}, done)
			})
			it('403 | cannot submit a flag if not on a team', function (done) {
				request(app)
					.post('/competitions/2/challenges/5/submissions')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[7])
					.send({
						_csrf: 'abc',
						flag: 'test flag 2'
					})
					.expect(403)
					.expect({message: 'user_not_on_team'}, done)
			})
			it('400 | cannot submit a flag for a solved challenge', function (done) {
				request(app)
					.post('/competitions/2/challenges/1/submissions')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.send({
						_csrf: 'abc',
						flag: 'test flag 2'
					})
					.expect(400)
					.expect({message: 'challenge_already_solved'}, done)
				})
		})
		describe('GET /competitions/{id}/challenges/{id}', function () {
			it('200 | gets a challenge', function (done) {
				request(app)
					.get('/competitions/2/challenges/1')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect(200)
					.then(function (response) {
						assert.strictEqual(Object.keys(response.body).length, 8)
						assert.strictEqual(response.body.id, 1)
						assert.strictEqual(response.body.title, 'test title 2')
						assert.strictEqual(response.body.value, 2)
						assert.strictEqual(response.body.description, 'test description 2')
						assert.strictEqual(response.body.author, 'test author 2')
						assert.strictEqual(response.body.category, 'test category 2')
						assert.strictEqual(typeof response.body.created, 'string')
						assert.strictEqual(response.body.solves.length, 1)
						assert.strictEqual(response.body.solves[0].id, 2)
						assert.strictEqual(response.body.solves[0].team.id, 3)
						assert.strictEqual(response.body.solves[0].team.name, 'edited name')
						assert.strictEqual(response.body.solves[0].team.affiliation, 'edited affiliation')
						assert.strictEqual(Object.keys(response.body.solves[0].team).length, 3)
						assert.strictEqual(typeof response.body.solves[0].time, 'string')
						assert.strictEqual(response.body.solves[0].user.id, 3)
						assert.strictEqual(response.body.solves[0].user.username, 'test1')
						assert.strictEqual(Object.keys(response.body.solves[0].user).length, 2)
						done()
					}).catch(function (error) {
						done(error)
					})
			})
			it('404 | returns challenge not found', function (done) {
				request(app)
					.get('/competitions/2/challenges/4')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.expect(404)
					.expect({message: 'challenge_not_found'}, done)
			})
		})
		describe('DELETE /competitions/{id}/challenges/{id}', function () {
			it('403 | doesn\'t allow non-admin to delete', function (done) {
				request(app)
					.delete('/competitions/2/challenges/1')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.query({_csrf: 'abc'})
					.expect(403)
					.expect({message: 'action_forbidden'}, done)
			})
			it('204 | deletes a challenge', function (done) {
				request(app)
					.delete('/competitions/2/challenges/1')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + adminAuth)
					.query({_csrf: 'abc'})
					.expect(204)
					.then(function () {
						request(app)
							.get('/competitions/2/challenges/1')
							.set('referer', 'https://angstromctf.com')
							.set('host', 'angstromctf.com')
							.expect(404, done)
					}).catch(function (error) {
						done(error)
					})
			})
		})
	})

	describe('Self', function () {
		describe('GET /self', function () {
			it('200 | returns current user and competition (with team)', function (done) {
				request(app)
					.get('/self')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[3])
					.expect(200)
					.then(function (response) {
						assert.strictEqual(Object.keys(response.body).length, 2)
						assert.strictEqual(Object.keys(response.body.user).length, 6)
						assert.strictEqual(Object.keys(response.body.user.team).length, 7)
						assert.strictEqual(Object.keys(response.body.competition).length, 7)
						assert.strictEqual(response.body.user.id, 3)
						assert.strictEqual(response.body.user.username, 'test1')
						assert.strictEqual(response.body.user.eligible, true)
						assert.strictEqual(typeof response.body.user.created, 'string')
						assert.strictEqual(response.body.user.email, 'test1@test.test')
						assert.strictEqual(response.body.user.team.id, 3)
						assert.strictEqual(typeof response.body.user.team.created, 'string')
						assert.strictEqual(response.body.user.team.name, 'edited name')
						assert.strictEqual(response.body.user.team.affiliation, 'edited affiliation')
						assert.strictEqual(response.body.user.team.eligible, true)
						assert.deepStrictEqual(response.body.user.team.solves, [])
						assert.strictEqual(response.body.user.team.members.length, 1)
						assert.deepStrictEqual(Object.keys(response.body.user.team.members[0]), ['id', 'username', 'eligible', 'created'])
						done()
					}).catch(function (error) {
						done(error)
					})
			})
			it('200 | returns current user and competition (without team)', function (done) {
				request(app)
					.get('/self')
					.set('referer', 'https://angstromctf.com')
					.set('host', 'angstromctf.com')
					.set('cookie', '_csrf=abc; token=' + userAuth[7])
					.expect(200)
					.then(function (response) {
						assert.strictEqual(Object.keys(response.body).length, 2)
						assert.strictEqual(Object.keys(response.body.user).length, 5)
						assert.strictEqual(Object.keys(response.body.competition).length, 7)
						assert.strictEqual(response.body.user.id, 6)
						assert.strictEqual(response.body.user.username, 'test4')
						assert.strictEqual(response.body.user.eligible, true)
						assert.strictEqual(typeof response.body.user.created, 'string')
						assert.strictEqual(response.body.user.email, 'test4@test.test')
						done()
					}).catch(function (error) {
						done(error)
					})
			})
		})
	})

	describe('Authorization', function () {
		it('401 | PATCH /competitions/{id}/users/{id}', function (done) {
			request(app)
				.patch('/competitions/2/users/1')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc' })
				.expect(401, done)
		})
		it('401 | POST /competitions/{id}/teams', function (done) {
			request(app)
				.post('/competitions/2/teams')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc' })
				.expect(401, done)
		})
		it('401 | PATCH /competitions/{id}/teams', function (done) {
			request(app)
				.patch('/competitions/2/teams')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc' })
				.expect(401, done)
		})
		it('401 | PATCH /competitions/{id}/teams/{id}', function (done) {
			request(app)
				.patch('/competitions/2/teams/1')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc' })
				.expect(401, done)
		})
		it('401 | POST /admin/auth', function (done) {
			request(app)
				.post('/admin/auth')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc', username: 'x', password: 'x' })
				.expect(401, done)
		})
		it('401 | POST /competitions/{id}/auth', function (done) {
			request(app)
				.post('/competitions/2/auth')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc', username: 'x', password: 'x' })
				.expect(401, done)
		})
		it('401 | GET /self', function (done) {
			request(app)
				.get('/self')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc' })
				.expect(401, done)
		})
		it('401 | POST /competitions/{id}/challenges', function (done) {
			request(app)
				.post('/competitions/2/challenges')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc' })
				.expect(401, done)
		})
		it('401 | POST /competitions/{id}/challenges/{id}/submissions', function (done) {
			request(app)
				.post('/competitions/2/challenges/1/submissions')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc' })
				.expect(401, done)
		})
		it('401 | PATCH /competitions/{id}/challenges/{id}', function (done) {
			request(app)
				.patch('/competitions/2/challenges/1')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc' })
				.expect(401, done)
		})
		it('401 | DELETE /competitions/{id}/challenges/{id}', function (done) {
			request(app)
				.delete('/competitions/2/challenges/1')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc' })
				.expect(401, done)
		})
		it('401 | POST /competitions', function (done) {
			request(app)
				.post('/competitions')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc' })
				.expect(401, done)
		})
		it('401 | PATCH /competitions/{id}', function (done) {
			request(app)
				.patch('/competitions/2')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc' })
				.expect(401, done)
		})
		it('401 | DELETE /competitions/{id}', function (done) {
			request(app)
				.delete('/competitions/2')
				.set('referer', 'https://angstromctf.com')
				.set('host', 'angstromctf.com')
				.set('cookie', '_csrf=abc')
				.send({ _csrf: 'abc' })
				.expect(401, done)
		})
	})

})