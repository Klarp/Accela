// Copyright (C) 2021 Brody Jagoe

const { MessageEmbed } = require('discord.js');

const { sConfig } = require('../../dbObjects');
const Sentry = require('../../log');

module.exports = {
	name: 'config',
	description: 'Set\'s configuration for the server',
	module: 'Admin',
	guildOnly: true,
	perms: 'MANAGE_GUILD',
	async execute(message) {

		// I need to make this a command a bit more simpler the set up is a bit spammy

		let prefix = '>>';

		let modChannel = '';

		let msgLogChannel = '';

		let modChannelClean = '';

		let logChannelClean = '';

		/** @type {boolean} */
		let modCommands = false;

		/** @type {boolean} */
		let modLogging = false;

		/** @type {boolean} */
		let msgLogging = false;

		const filter = m => m.author === message.author;

		// SET COMMAND PREFIX
		await message.channel.send('What would you like the prefix to be?').then(() => {
			// Await the next message
			message.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
				.then(collected => {
					// Set collected message content as the prefix
					prefix = collected.first().content;
					// Move to mod commands
					modCommandsFunc();
				})
				.catch(collected => {
					if (collected.size == 0) {
						return message.reply('you did not answer in time');
					} else {
						console.log(collected.size);
					}
				});
		});

		async function modCommandsFunc() {
			await message.channel.send('Would you like to have mod commands active? (Yes or No)').then(() => {
				// Await the next message
				message.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
					.then(collected => {
						// If yes turn mod commands on else leave it off
						if (collected.first().content.toLowerCase() === 'yes') {
							modCommands = true;
						} else if (collected.first().content.toLowerCase() === 'no') {
							modCommands = false;
						} else {
							return message.reply('that is not a valid reply');
						}
						// Move to mod logging
						modLoggingFunc(modCommands);
					})
					.catch(collected => {
						if (collected.size == 0) {
							return message.reply('you did not answer in time');
						} else {
							console.log(collected.size);
						}
					});
			});
		}

		async function modLoggingFunc(modFlag) {
			// Only continue if mod commands are allowed
			if(modFlag) {
				await message.channel.send('Would you like to log mod commands? (Yes or No)').then(() => {
					// Await the next message
					message.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
						.then(collected => {
							// If yes turn mod logging on else leave it off
							if (collected.first().content.toLowerCase() === 'yes') {
								modLogging = true;
							} else if (collected.first().content.toLowerCase() === 'no') {
								modLogging = false;
							} else {
								return message.reply('that is not a valid reply');
							}
							// Move to mod channel
							modChannelFunc(modLogging);
						})
						.catch(collected => {
							if (collected.size == 0) {
								return message.reply('you did not answer in time');
							} else {
								console.log(collected.size);
							}
						});
				});
			} else {
				// Move to message logging
				msgLoggingFunc();
			}
		}

		async function modChannelFunc(modFlag) {
			// Only continue if mod logging is allowed
			if (modFlag) {
				await message.channel.send('What is your moderation channel? (if applicable)').then(() => {
					// Await the next message
					message.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
						.then(collected => {
							// Find first channel in message content (Channel ID)
							modChannel = collected.first().content.match(/\d+/)[0];
							// Find first channel in message content (Actual Channel)
							modChannelClean = collected.first().content;
							// Move to message logging
							msgLoggingFunc();
						})
						.catch(collected => {
							if (collected.size == 0) {
								return message.reply('you did not answer in time');
							} else {
								console.log(collected.size);
							}
						});
				});
			} else {
				// Move to message logging
				msgLoggingFunc();
			}
		}

		async function msgLoggingFunc() {
			await message.channel.send('Would you like to log messages? (Yes or No)').then(() => {
				// Await the next message
				message.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
					// If yes turn message logging on else leave it off
					.then(collected => {
						if (collected.first().content.toLowerCase() === 'yes') {
							msgLogging = true;
						} else if (collected.first().content.toLowerCase() === 'no') {
							msgLogging = false;
						} else {
							return message.reply('that is not a valid reply');
						}
						// Move to log channel
						msgLogChannelFunc(msgLogging);
					})
					.catch(collected => {
						if (collected.size == 0) {
							return message.reply('you did not answer in time');
						} else {
							console.log(collected.size);
						}
					});
			});
		}

		async function msgLogChannelFunc(logFlag) {
			// Only continue if message logging is allowed
			if (logFlag) {
				await message.channel.send('What is your message logging channel? (if applicable)').then(() => {
					// Await the next message
					message.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
						.then(collected => {
							// Find first channel in message content (Channel ID)
							msgLogChannel = collected.first().content.match(/\d+/)[0];
							// Find first channel in message content (Actual Channel)
							logChannelClean = collected.first().content;
							// Move to no prefix commands
							configFunc();
						})
						.catch(collected => {
							if (collected.size == 0) {
								return message.reply('you did not answer in time');
							} else {
								console.log(collected.size);
							}
						});
				});
			} else {
				// Move to no prefix commands
				configFunc();
			}
		}

		async function configFunc() {
			// Create new database entry
			try {
				await sConfig.create({
					guild_id: message.guild.id,
					prefix: prefix,
					mod_channel: modChannel,
					msgLog_channel: msgLogChannel,
					mod_commands: modCommands,
					mod_logging: modLogging,
					msg_logging: msgLogging,
				});
			} catch(e) {
				// If server is already in the database update the values
				if (e.name === 'SequelizeUniqueConstraintError') {
					try {
						const upConfig = await sConfig.update({
							prefix: prefix,
							mod_channel: modChannel,
							msgLog_channel: msgLogChannel,
							mod_commands: modCommands,
							mod_logging: modLogging,
							msg_logging: msgLogging,
						},
						{
							where: { guild_id: message.guild.id },
						});
						// If the server is updated log the update
						if (upConfig > 0) {
							console.log(`Updated server config on ${message.guild.name}`);
						}
					} catch(err) {
						Sentry.captureException(err);
						console.error(err);
					}
				}
			}
			// Config Embed Start
			const configEmbed = new MessageEmbed()
				.setTitle('Server Config')
				.setDescription(`Prefix: ${prefix}

Mod Channel: ${modChannelClean}
Log Channel: ${logChannelClean}

Mod Commands: ${modCommands}
Mod Logging: ${modLogging}
Message Logging: ${msgLogging}`);
			// Send the config embed
			message.channel.send({ embeds: [configEmbed] });
		}
	},
};