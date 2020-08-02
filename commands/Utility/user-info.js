const Discord = require('discord.js');

module.exports = {
	name: 'user-info',
	description: 'Get information about yourself or a user',
	module: 'Utility',
	aliases: ['userinfo', 'uinfo'],
	usage: '<user>',
	execute(message) {
		const status = {
			online: 'Online',
			idle: 'Idle',
			dnd: 'Do Not Disturb',
			offline: 'Offline/Invisible',
		};
		const member = message.mentions.members.first() || message.member;
		const target = message.mentions.users.first() || message.author;

		const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });
		const lastSeen = member.lastMessage.createdAt;
		const joined = member.joinedAt;
		const created = target.createdAt;
		const [{ value: lmonth },, { value: lday },, { value: lyear }] = dateTimeFormat.formatToParts(lastSeen);
		const [{ value: jmonth },, { value: jday },, { value: jyear }] = dateTimeFormat.formatToParts(joined);
		const [{ value: cmonth },, { value: cday },, { value: cyear }] = dateTimeFormat.formatToParts(created);

		const roles = member.roles.cache.map(r => `${r}`).join(' | ');
		const name = member.nickname || 'None';

		let game = 'None';
		let gameState = 'None';

		if (target.presence.activities[1]) {
			game = target.presence.activities[1].name;
			gameState = target.presence.activities[1].state;
		}

		const infoEmbed = new Discord.MessageEmbed()
			.setAuthor(`${target.tag} (${target.id})`, target.displayAvatarURL({ dynamic : true }))
			.setColor('BLUE')
			.setDescription(`**Nickname:** ${name} 
			**Status:** ${status[target.presence.status]}
			**Activity:** ${target.presence.activities[0].state}
			**Playing:** ${game} (${gameState})
			
			**Joined On:** ${jday} ${jmonth} ${jyear} ${joined.toLocaleTimeString()}
			**Last Seen:** ${lday} ${lmonth} ${lyear} ${lastSeen.toLocaleTimeString()}
			
			**Roles:** ${roles}`)
			.setFooter(`Joined Discord: ${cday} ${cmonth} ${cyear} ${created.toLocaleTimeString()}`);

		message.channel.send(infoEmbed);
	},
};