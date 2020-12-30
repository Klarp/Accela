const Discord = require('discord.js');
const { timeSince } = require('../../utils');

module.exports = {
	name: 'user-info',
	aliases: ['userinfo', 'uinfo'],
	description: 'Get information about yourself or a user',
	module: 'Utility',
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
		let lastTime;
		let lastTimeSince;
		let lmonth, lday, lyear;
		if (member.lastMessage) {
			lastSeen = member.lastMessage.createdAt;
			lastTime = lastSeen.toLocaleTimeString();
			lastTimeSince = timeSince(lastSeen);
			[{ value: lmonth },, { value: lday },, { value: lyear }] = dateTimeFormat.formatToParts(lastSeen);
		} else {
			lastSeen = 'Unknown';
		}
		const joined = member.joinedAt;
		const created = target.createdAt;
		const joinTime = joined.toLocaleTimeString();
		const createdTime = created.toLocaleTimeString();
		const joinSince = timeSince(joined);
		const createdSince = timeSince(created);
		const [{ value: jmonth },, { value: jday },, { value: jyear }] = dateTimeFormat.formatToParts(joined);
		const [{ value: cmonth },, { value: cday },, { value: cyear }] = dateTimeFormat.formatToParts(created);

		const roles = member.roles.cache
			.filter(r => r.name !== '@everyone')
			.sort((a, b) => b.position - a.position)
			.map(r => `${r}`).join(' | ');
		const name = member.nickname || 'None';

		let game = 'None';
		let gameState = 'None';
		let activity = 'None';

		if (target.presence.activities[0]) {
			activity = target.presence.activities[0].state;
		}

		if (target.presence.activities[1]) {
			game = target.presence.activities[1].name;
			if (target.presence.activities[1].state) {
				gameState = target.presence.activities[1].state;
			}
			if (target.presence.activities[1].name === 'Spotify') {
				console.log(target.presence.activities[1]);
				gameState = `${target.presence.activities[1].state} - ${target.presence.activities[1].details}`;
			}
		}

		let lastDate;

		if (lday) {
			lastDate = `${lday} ${lmonth} ${lyear}`;
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
			
**Joined Server:** ${joinSince} \`${jday} ${jmonth} ${jyear} ${joinTime}\`
**Last Seen:** ${lastTimeSince} \`${lastDate} ${lastTime}\`
			
**Roles:** ${roles}`)
			.setFooter(`Joined Discord: ${createdSince} (${cday} ${cmonth} ${cyear} ${createdTime})`);

		message.channel.send(infoEmbed);
	},
};