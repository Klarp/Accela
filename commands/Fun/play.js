// Copyright (C) 2021 Brody Jagoe

module.exports = {
	name: 'play',
	aliases: 'playmore',
	description: 'How to get better at osu!',
	module: 'Fun',
	cooldown: 60,
	execute(message) {
		message.channel.send('https://cdn.discordapp.com/attachments/158484765136125952/740942824341766316/play_more.gif');
	},
};