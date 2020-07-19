module.exports = {
	name: 'userinfo',
	module: 'Utility',
	aliases: 'uinfo',
	usage: '<user>',
	// userPermissions: 'MANAGE_CHANNELS',
	execute(message) {
		const status = {
			online: 'Online',
			idle: 'Idle',
			dnd: 'Do Not Disturb',
			offline: 'Offline/Invisible',
		};
		// member
		const member = message.mentions.members.first() || message.member;
		// user
		const target = message.mentions.users.first() || message.author;

		const userEmbed = {
			color: 0x0099ff,
			title: `${member.nickname || target.username}'s Info`,
			author: {
				name: target.tag,
				icon_url: target.displayAvatarURL,
			},
			fields: [
				{
					name: 'Joined Discord: ',
					value: target.createdAt.toLocaleDateString(),
					inline: true,
				},
				{
					name: 'Joined Server: ',
					value: member.joinedAt.toLocaleDateString(),
					inline: true,
				},
				{
					name: 'Bot: ',
					value: target.bot,
					inline: false,
				},
				{
					name: 'Status: ',
					value: `${status[target.presence.status]}`,
					inline: false,
				},
				{
					name: 'Roles: ',
					value: member.roles.cache.map(r => `${r}`).join(' | '),
					inline: false,
				},
			],
		};

		message.channel.send({ embed: userEmbed });
	},
};