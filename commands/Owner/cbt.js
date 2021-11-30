// Copyright (C) 2021 Brody Jagoe
// Special thanks to all those helped me with this such as Stedoss, uyitroa and phil.
const { owners } = require('../../config.json');

module.exports = {
	name: 'cbt',
	description: 'Displays cbt definition',
	module: 'Owner',
	owner: false,
	async execute(message) {
		if (!owners.includes(message.author.id)) {
			message.channel.send('osu!catch, formerly known as osu!cbt (**c**atch **b**eat **t**he), is a game mode which consists of catching fruit to the beat by controlling a mini-character holding a plate.');
		} else {
			message.channel.send('**C**ock and **B**all **T**orture is a sexual activity involving application of pain or constriction to the penis or testicles.');
		}
	},
};