const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'osuUsers.sqlite',
});

const seqMute = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'mutedUsers.sqlite',
});

const Muted = require('./models/Muted')(seqMute, Sequelize);

const Users = require('./models/Users')(sequelize, Sequelize);

module.exports = { Users, Muted };