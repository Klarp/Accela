const Discord = require('discord.js');

module.exports = {
	name: 'page-test',
	description: 'Reaction based page test',
	aliases: 'page',
	owner: true,
	module: 'Admin',
	execute(message) {
		let embed = new Discord.MessageEmbed()
			.setColor('0xff69b4')
			.setDescription('This is a test');

		message.channel.send(embed)
			.then(m => {
				m.react('➡️');

				const filter = (reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id;
				const collector = m.createReactionCollector(filter, { max: 1, time: 5 * 60 * 1000 });

				collector.on('collect', () => {
					m.reactions.removeAll();

					embed = new Discord.MessageEmbed()
						.setColor('0xff69b4')
						.setDescription('This is a test but on page 2');
					m.edit(embed);
					m.react('➡️');
				});
			}).catch(e => console.error(e));
	},
};