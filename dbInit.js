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
	logging: true,
	storage: 'mutedUsers.sqlite',
});

require('./models/Muted.js')(seqMute, Sequelize);

require('./models/Users.js')(sequelize, Sequelize);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	console.log('osu! users synced');
	sequelize.close();
}).catch(console.error);

seqMute.sync({ force }).then(async () => {
	console.log('Muted users synced');
	seqMute.close();
}).catch(console.error);