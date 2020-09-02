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
	modCmd: true,
	usage: '<user> <time> <reason>',
	async execute(message, args) {
		// >>temp-mute [user] [time] [reason]

		// Stop if no mentions found
		if (!message.mentions.members.first()) return message.reply('Please mention a user.');
		// Grab the first mentions in the message
		const tag = message.mentions.members.first();
		// Stop if the mention is the message author
		if (message.author === tag) return message.reply('You can not use this on yourself');
		// Remove the mention from the arguments
		args.shift();
		// Get the time from the arguments
		const muteTime = args.shift();
		// Join the arguments to make the reason
		let reason = args.join(' ');
		// If no reason is found default to this
		if (!reason) reason = 'No Reason Given';
		// Find muted role in the server
		let muteRole = message.guild.roles.cache.find(r => r.name === 'muted');

		// MUTE ROLE CREATION START
		if (!muteRole) {
			try {
				// Attempts to create the muted role
				muteRole = await message.guild.roles.create({
					data: {
						name: 'muted',
						permissions: [],
					},
					reason: 'Adding muted role for command',
				});
				// Changes roles permissions in each channel so they are unable to talk
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

		// Stop if no time is specified
		if (!muteTime) return message.reply('Please specify a time.');

		// Stop if user is already muted
		if(tag.roles.cache.find(r => r.name === 'muted')) {
			message.reply('Member is already muted.');
		} else {
			// Give the user the muted role
			tag.roles.add(muteRole.id).then(() => {
				tag.send(`You have been temp muted in ${message.guild.name} for ${ms(ms(muteTime))}! Reason: ${reason}`);
			});
			message.channel.send(`Muted: ${tag.user} for ${ms(ms(muteTime))}`);
			// Log the mute
			modAction(message.author, tag, 'TempMute', reason, muteTime);

			// Remove mute after time is finished
			setTimeout(function() {
				tag.roles.remove(muteRole.id);
				modAction(message.author, tag, 'Unmute', 'Temp Mute Removal');
			}, ms(muteTime));
		}
	},
};