// Copyright (C) 2021 Brody Jagoe

const { Client } = require('../../index.js');

module.exports = {
	name: 'ping',
	description: 'Get the websocket ping',
	module: 'Utility',
	cooldown: 5,
	execute(message) {
		message.channel.send(`Pong: ${Math.round(Client.ws.ping)}ms`);
	},
};