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
		let lastSeen;
		let lmonth, lday, lyear, ltime;
		if (member.lastMessage) {
			lastSeen = member.lastMessage.createdAt;
			[{ value: lmonth },, { value: lday },, { value: lyear }] = dateTimeFormat.formatToParts(lastSeen);
			ltime = lastSeen.toLocaleTimeString();
		} else {
			lastSeen = 'Unknown';
		}
		const joined = member.joinedAt;
		const created = target.createdAt;
		const [{ value: jmonth },, { value: jday },, { value: jyear }] = dateTimeFormat.formatToParts(joined);
		const [{ value: cmonth },, { value: cday },, { value: cyear }] = dateTimeFormat.formatToParts(created);

		const roles = member.roles.cache.map(r => `${r}`).join(' | ');
		const name = member.nickname || 'None';

		let game = 'None';
		let gameState = 'None';
		let activity = 'None';

		if (target.presence.activities[0]) {
			activity = target.presence.activities[0].state;
		}

		if (target.presence.activities[1]) {
			game = target.presence.activities[1].name;
			gameState = target.presence.activities[1].state;
		}

		let lastDate;

		if (lday) {
			lastDate = `${lday} ${lmonth} ${lyear} ${ltime}`;
		} else {
			lastDate = 'Unknown';
		}

		const infoEmbed = new Discord.MessageEmbed()
			.setAuthor(`${target.tag} (${target.id})`, target.displayAvatarURL({ dynamic : true }))
			.setColor('BLUE')
			.setDescription(`**Nickname:** ${name} 
			**Status:** ${status[target.presence.status]}
			**Activity:** ${activity}
			**Playing:** ${game} (${gameState})
			
			**Joined On:** ${jday} ${jmonth} ${jyear} ${joined.toLocaleTimeString()}
			**Last Seen:** ${lastDate}
			
			**Roles:** ${roles}`)
			.setFooter(`Joined Discord: ${cday} ${cmonth} ${cyear} ${created.toLocaleTimeString()}`);

		message.channel.send(infoEmbed);
	},
};