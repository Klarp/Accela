// Copyright (C) 2021 Brody Jagoe

module.exports = {
	name: 'skill',
	aliases: ['skillissue', 'issue'],
	description: 'You got an issue with your skill',
	module: 'Fun',
	cooldown: 60,
	execute(message) {
		message.channel.send('https://cdn.discordapp.com/attachments/98226572468690944/888634530355871794/cooltext393339445436163.gif');
	},
};