// Copyright (C) 2021 Brody Jagoe

module.exports = {
	name: 'cmd-test',
	aliases: 'cmdtest',
	description: 'Tests any future commands',
	module: 'Owner',
	owner: true,
	execute(message) {
		message.channel.send('oink');
	},
};