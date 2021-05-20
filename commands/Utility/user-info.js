// Copyright (C) 2021 Brody Jagoe

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
		let memberFlag = false;
		if (!member && args[0]) {
			memberFlag = true;
			member = message.guild.member(args[0]);
		}
		if (!member && !memberFlag) member = message.member;

		let target = message.mentions.users.first();
		let targetFlag = false;
		if (!target && args[0]) {
			targetFlag = true;
			if (!message.guild.member(args[0])) return message.reply('Could not find user.');
			target = message.guild.member(args[0]).user;
		}
		if (!target && !targetFlag) target = message.member.user;

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
		let customStatus = 'None';
		if (target.presence.activities[0]) {
			if (target.presence.activities[0].type === 'CUSTOM_STATUS') {
				customStatus = target.presence.activities[0].state;
				if (customStatus === null) customStatus = 'None';
				if (target.presence.activities[1]) {
					game = target.presence.activities[1].name;
					if (game === null) game = 'None';
					if (target.presence.activities[1].state) {
						gameState = target.presence.activities[1].state;
						if (gameState === null) gameState = 'None';
					}
					if (target.presence.activities[1].details) {
						gameState = target.presence.activities[1].details;
					}
					if (target.presence.activities[1].name === 'Spotify') {
						gameState = `${target.presence.activities[1].state} - ${target.presence.activities[1].details}`;
					}
				}
			} else {
				game = target.presence.activities[0].name;
				if (game === null) game = 'None';
				if (target.presence.activities[0].state) {
					gameState = target.presence.activities[0].state;
					if (gameState === null) gameState = 'None';
				}
				if (target.presence.activities[0].details) {
					gameState = target.presence.activities[0].details;
				}
				if (target.presence.activities[0].name === 'Spotify') {
					gameState = `${target.presence.activities[0].state} - ${target.presence.activities[0].details}`;
				}
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
**Custom Status:** ${customStatus}
**Playing:** ${game} (${gameState})
			
**Joined Server:** ${joinSince} \`${jday} ${jmonth} ${jyear} ${joinTime}\`
**Last Seen:** ${lastTimeSince} ${lastMessage}
			
**Roles:** ${roles}`)
			.setFooter(`Joined Discord: ${createdSince} (${cday} ${cmonth} ${cyear} ${createdTime})`);

		message.channel.send(infoEmbed);
	},
};