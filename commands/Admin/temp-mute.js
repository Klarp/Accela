const modAction = require('../../utils/modAction.js');
const ms = require('ms');

module.exports = {
	name: 'temp-mute',
	aliases: ['tempmute', 'tmute'],
	description: 'Temporally mutes users.',
	module: 'Admin',
	guildOnly: true,
	perms: 'MANAGE_ROLES',
	args: true,
	usage: '<user> <time>',
	async execute(message, args) {
		if (!message.mentions.members.first()) return message.reply('Please mention a user.');
		const tag = message.mentions.members.first();
		if (message.author === tag) return message.reply('You can not use this on yourself');s
		args.shift();
		const muteTime = args.shift();
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

		if (!muteTime) return message.reply('Please specify a time.');

		if(tag.roles.cache.find(r => r.name === 'muted')) {
			message.reply('Member is already muted.');
		} else {
			tag.roles.add(muteRole.id).then(() => {
				tag.send(`You have been temp muted in ${message.guild.name} for ${ms(ms(muteTime))}! Reason: ${reason}`);
			});
			message.channel.send(`Muted: ${tag.user} for ${ms(ms(muteTime))}`);
			modAction(message.author, tag, 'TempMute', reason, muteTime);

			setTimeout(function() {
				tag.roles.remove(muteRole.id);
				modAction(message.author, tag, 'Unmute', 'Temp Mute Removal');
			}, ms(muteTime));
		}
	},
};