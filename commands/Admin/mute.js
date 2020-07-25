const modAction = require('../../utils/modAction.js');
const { Muted } = require('../../dbObjects');

module.exports = {
	name: 'mute',
	aliases: 'silence',
	description: 'Mute a member',
	module: 'Admin',
	guildOnly: true,
	perms: 'MANAGE_ROLES',
	args: true,
	usage: '<user>',
	async execute(message, args) {
		if (!message.mentions.members.first()) return message.reply('Please mention a user.');
		const tag = message.mentions.members.first();
		if (message.member === tag) return message.reply('You can not use this on yourself');
		args.shift();
		let reason = args.join(' ');
		if (!reason) reason = 'No Reason Given';
		let muteRole = message.guild.roles.cache.find(r => r.name === 'muted');

		if (!muteRole) {
			try {
				muteRole = await message.guild.roles.create({
					data: {
						name: 'muted',
						permissions: [],
					},
					reason: 'Adding muted role for command',
				});
				message.guild.channels.cache.forEach(async (channel) => {
					await channel.updateOverwrite(muteRole,
						{
							SEND_MESSAGES: false,
							ADD_REACTIONS: false,
							SEND_TTS_MESSAGES: false,
							ATTACH_FILES: false,
						}, 'Removing permissions for muted role');
				});
			} catch(e) {
				console.log(e.stack);
			}
		}

		if(tag.roles.cache.find(r => r.name === 'muted')) {
			message.reply('Member is already muted.');
		} else {
			tag.roles.add(muteRole.id).then(() => {
				tag.send(`You have been muted in ${message.guild.name}! Reason: ${reason}`);
			});
			message.channel.send(`Muted: ${tag.user}`);
			modAction(message.author, tag, 'Mute', reason);
			try {
				await Muted.create({
					user_id: tag.id,
					guild_id: message.guild.id,
				});
			} catch(e) {
				if (e.name === 'SequelizeUniqueConstraintError') {
					console.log(`${tag.username} has been tried to be muted.`);
				} else {
					console.error(e);
					return message.reply('Error: "Something" wen\'t wrong.');
				}
			}
		}


	},
};