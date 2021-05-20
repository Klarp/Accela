// Copyright (C) 2021 Brody Jagoe

const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'vote',
	description: 'Posts the voting links for Accela',
	module: 'Utility',
	execute(message) {
		const voteEmbed = new MessageEmbed()
			.setTitle('Vote for Accela')
			.setColor('#af152a')
			.setDescription(`[top.gg](https://top.gg/bot/687856844848234502/vote)

[Bots For Discord](https://botsfordiscord.com/bot/687856844848234502/vote)

[Discord Bot List](https://discordbotlist.com/bots/accela/upvote)`);

		message.channel.send(voteEmbed);
	},
};