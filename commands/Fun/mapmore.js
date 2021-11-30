// Copyright (C) 2021 Brody Jagoe

module.exports = {
	name: 'mapmore',
	aliases: ['mapm'],
	description: 'How to get better at mapping!',
	module: 'Fun',
	cooldown: 60,
	execute(message) {
		message.channel.send('https://cdn.discordapp.com/attachments/98226572468690944/901298374618284072/mapmore.gif');
	},
};