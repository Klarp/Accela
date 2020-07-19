const { Client } = require('../../index.js');

module.exports = {
	name: 'ping',
	description: 'Ping!',
	module: 'Utility',
	cooldown: 5,
	execute(message) {
		message.channel.send(`Pong: ${Math.round(Client.ws.ping)}ms`);
	},
};