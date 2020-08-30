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

		function dhm(t) {
			const cd = 24 * 60 * 60 * 1000;
			const ch = 60 * 60 * 1000;
			let d = Math.floor(t / cd);
			let h = Math.floor((t - d * cd) / ch);
			let m = Math.round((t - d * cd - h * ch) / 60000);
			const pad = function(n) { return n < 10 ? '0' + n : n; };
			if(m === 60) {
				h++;
				m = 0;
			}
			if(h === 24) {
				d++;
				h = 0;
			}
			return `${d}d ${pad(h)}h ${pad(m)}m`;
		}

		const uptime = dhm(Client.uptime);

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