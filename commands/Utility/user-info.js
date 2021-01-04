const Discord = require('discord.js');
const { timeSince } = require('../../utils');

module.exports = {
	name: 'user-info',
	aliases: ['userinfo', 'uinfo'],
	description: 'Get information about yourself or a user',
	module: 'Utility',
	usage: '<user>',
	execute(message, args) {
		const status = {
			online: 'Online',
			idle: 'Idle',
			dnd: 'Do Not Disturb',
			offline: 'Offline/Invisible',
		};
		let member = message.mentions.members.first();
		if (!member && args[0]) member = message.guild.member(args[0]);
		if (!member) member = message.member;

		let target = message.mentions.users.first();
		if (!target && args[0]) target = message.guild.member(args[0]).user;
		if (!target) target = message.member.user;

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
			lastTime = '';
		}

		if (!lastTimeSince) lastTimeSince = 'Unknown';

		console.log(target);
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
			if (activity === null) activity = 'None';
		}

		if (target.presence.activities[1]) {
			game = target.presence.activities[1].name;
			if (game === null) game = 'None';
			if (target.presence.activities[1].state) {
				gameState = target.presence.activities[1].state;
				if (gameState === null) gameState = 'None';
			}
			if (target.presence.activities[1].name === 'Spotify') {
				gameState = `${target.presence.activities[1].state} - ${target.presence.activities[1].details}`;
			}
		}

		let lastDate;

		if (lday) {
			lastDate = `${lday} ${lmonth} ${lyear}`;
		} else {
			lastDate = 'Unknown';
		}

		let lastMessage = '';

		if (member.lastMessage) lastMessage = `\`${lastDate} ${lastTime}\``;

		const infoEmbed = new Discord.MessageEmbed()
			.setAuthor(`${target.tag} (${target.id})`, target.displayAvatarURL({ dynamic : true }))
			.setColor('BLUE')
			.setDescription(`**Nickname:** ${name} 
**Status:** ${status[target.presence.status]}
**Activity:** ${activity}
**Playing:** ${game} (${gameState})
			
**Joined Server:** ${joinSince} \`${jday} ${jmonth} ${jyear} ${joinTime}\`
**Last Seen:** ${lastTimeSince} ${lastMessage}
			
**Roles:** ${roles}`)
			.setFooter(`Joined Discord: ${createdSince} (${cday} ${cmonth} ${cyear} ${createdTime})`);

		message.channel.send(infoEmbed);
	},
};