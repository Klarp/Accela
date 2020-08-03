const Discord = require('discord.js');
const { sConfig } = require('../../dbObjects');

module.exports = {
	name: 'prefix',
	description: 'Set\'s prefix for the server',
	module: 'Admin',
	guildOnly: true,
	perms: 'MANAGE_GUILD',
	args: true,
	usage: '<prefix>',
	async execute(message, args) {
		const prefix = args[0];

		try {
			await sConfig.create({
				guild_id: message.guild.id,
				prefix: prefix,
			});
		} catch(e) {
			if (e.name === 'SequelizeUniqueConstraintError') {
				try {
					const upConfig = await sConfig.update({
						prefix: prefix,
					},
					{
						where: { guild_id: message.guild.id },
					});
					if (upConfig > 0) {
						console.log(`Updated server config on ${message.guild.name}`);
					}
				} catch(err) {
					console.error(err);
				}
			}
		}

		const configEmbed = new Discord.MessageEmbed()
			.setTitle('Server Config')
			.setDescription(`Prefix: ${prefix}`);
		message.channel.send(configEmbed);
	},
};