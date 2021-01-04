const { MessageEmbed } = require('discord.js');
const { modAction } = require('../../utils');
const ms = require('ms');

module.exports = {
	name: 'temp-mute',
	aliases: ['tempmute', 'tmute'],
	description: 'Temporally mutes a member in the server',
	module: 'Admin',
	guildOnly: true,
	perms: 'MANAGE_ROLES',
	args: true,
	modCmd: true,
	usage: '<member> <time> <reason>',
	async execute(message, args) {
		// Stop if no mentions found
		if (!message.mentions.members.first()) return message.reply('Please mention a user.');

		/**
		 * Member to be temp-muted
		 * @const {Object}
		 */
		const tag = message.mentions.members.first() || message.guild.member(args[0]);

		// Stop if the mention is the message author
		if (message.author === tag) return message.reply('You can not use this on yourself');

		// Remove the mention from the arguments
		args.shift();

		/**
		 * Time to be muted
		 * @const {string} muteTime
		 */
		const muteTime = args.shift();

		/**
		 * @arg reason The temp-mute reason
		 */
		let reason = args.join(' ');

		// If no reason is found default to this
		if (!reason) reason = 'No Reason Given';

		/**
		 * Find muted role in the server
		 * @type {Object}
		 */
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
				const tempMuteEmbed = new MessageEmbed()
					.setTitle(`Temp Muted in ${message.guild.name}`)
					.setDescription(`Reason: ${reason}
Time: ${ms(ms(muteTime))}`);

				tag.send(tempMuteEmbed);
			});
			message.channel.send(`Muted: ${tag.user} for ${ms(ms(muteTime))}`);
			// Log the mute
			modAction(message.author, tag, 'TempMute', reason, muteTime);

			// Remove mute after time is finished
			setTimeout(function() {
				tag.roles.remove(muteRole.id);
				modAction(message.author, tag, 'Unmute', 'Temp Mute Removal', undefined);
			}, ms(muteTime));
		}
	},
};