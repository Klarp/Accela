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
	modCmd: true,
	usage: '<user>',
	async execute(message, args) {
		// >>mute [user] [reason]

		// Stop if no mentions found
		if (!message.mentions.members.first()) return message.reply('Please mention a user.');
		// Grab the first mention in the message
		const tag = message.mentions.members.first();
		// Stop if the mention is the message author
		if (message.member === tag) return message.reply('You can not use this on yourself');
		// Remove the mention from the arguments
		args.shift();
		// Join the arguments to make the reason
		let reason = args.join(' ');
		// If no reason is found default to this
		if (!reason) reason = 'No Reason Given';
		// Find the muted role in the server
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
				// Changes roles permissions in each channel so they are unable to speak
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
		// Stop if user is already muted
		if(tag.roles.cache.find(r => r.name === 'muted')) {
			message.reply('Member is already muted.');
		} else {
			// Give the user the muted role
			tag.roles.add(muteRole.id).then(() => {
				tag.send(`You have been muted in ${message.guild.name}! Reason: ${reason}`);
			});
			message.channel.send(`Muted: ${tag.user}`);
			// Log the mute
			modAction(message.author, tag, 'Mute', reason);
			// DATABASE ENTRY START
			try {
				// Add muted user to the database
				await Muted.create({
					user_id: tag.id,
					guild_id: message.guild.id,
				});
			} catch(e) {
				if (e.name === 'SequelizeUniqueConstraintError') {
					// If user is already in database send an error
					console.log(`${tag.username} has been tried to be muted.`);
				} else {
					console.error(e);
					return message.reply('Error: "Something" wen\'t wrong.');
				}
			}
		}


	},
};