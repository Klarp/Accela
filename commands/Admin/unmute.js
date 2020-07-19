const modAction = require('../../utils/modAction.js');

module.exports = {
	name: 'unmute',
	aliases: ['unsilence', 'umute'],
	description: 'Unmute a member',
	module: 'Admin',
	guildOnly: true,
	perms: 'MANAGE_ROLES',
	args: true,
	usage: '<user>',
	async execute(message, args) {
		if (!message.mentions.members.first()) return message.reply('Please mention a user.');
		const tag = message.mentions.members.first();
		args.shift();
		let reason = args.join(' ');
		if (!reason) reason = 'No Reason Given';
		const muteRole = message.guild.roles.cache.find(r => r.name === 'muted');

		if (!muteRole) {
			message.reply('[ERROR] No muted role found');
		}

		if(tag.roles.cache.find(r => r.name === 'muted')) {
			tag.roles.remove(muteRole.id).then(() => {
				tag.send(`You have been unmuted in ${message.guild.name}! Reason: ${reason}`);
			});
			message.channel.send(`Unmuted: ${tag.user}`);
			modAction(message.author, tag, 'Unmute', reason);
		} else {
			message.reply('Member is not muted.');
		}


	},
};