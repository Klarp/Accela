const Discord = require('discord.js');
const { Client } = require('../../index');
const { sConfig } = require('../../dbObjects');
const { version } = require('../../package.json');

module.exports = {
	name: 'bot-info',
	description: 'Get information about the bot',
	module: 'Utility',
	aliases: ['botinfo', 'binfo', 'info'],
	async execute(message) {
		let prefix = '>>';
		const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
		if (serverConfig) {
			prefix = serverConfig.get('prefix');
		}
		const bot = Client.user;
		const me = message.guild.me;
		const roles = me.roles.cache
			.filter(r => r.name !== '@everyone')
			.sort((a, b) => b.position - a.position)
			.map(r => `${r}`).join(' | ');
		let userCount = 0;

		Client.guilds.cache
			.each(guild => userCount += guild.memberCount);

		function msToTime(duration) {
			let seconds = Math.floor((duration / 1000) % 60);
			let minutes = Math.floor((duration / (1000 * 60)) % 60);
			let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

			hours = (hours < 10) ? '0' + hours : hours;
			minutes = (minutes < 10) ? '0' + minutes : minutes;
			seconds = (seconds < 10) ? '0' + seconds : seconds;

			return hours + ':' + minutes + ':' + seconds;
		}

		const uptime = msToTime(Client.uptime);

		const infoEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.username, bot.displayAvatarURL())
			.setColor('BLUE')
			.setDescription(`**Prefix:** ${prefix}
**Help Command:** ${prefix}help
**Total Servers:** ${Client.guilds.cache.size} (${userCount} users)
			
**Uptime:** ${uptime}
			
**Roles:** ${roles}`)
			.setFooter(`Created by: Karp#0001 | Version: ${version} | Framework: discord.js`);
		message.channel.send(infoEmbed);
	},
};