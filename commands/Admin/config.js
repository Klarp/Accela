const Discord = require('discord.js');
const { sConfig } = require('../../dbObjects');

module.exports = {
	name: 'config',
	description: 'Set\'s configuration for the server',
	module: 'Admin',
	guildOnly: true,
	perms: 'MANAGE_SERVER',
	usage: '<user>',
	async execute(message) {
		let prefix = '>>';
		let modChannel = '';
		let msgLogChannel = '';
		let modChannelClean = '';
		let logChannelClean = '';
		let modCommands = false;
		let modLogging = false;
		let msgLogging = false;
		let noPrefix = false;
		const filter = m => m.author === message.author;
		await message.channel.send('What would you like the prefix to be?').then(() => {
			message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
				.then(collected => {
					prefix = collected.first().content;
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
				message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
					.then(collected => {
						if (collected.first().content.toLowerCase() === 'yes') {
							modCommands = true;
						} else if (collected.first().content.toLowerCase() === 'no') {
							modCommands = false;
						} else {
							return message.reply('that is not a valid reply');
						}
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
			if(modFlag) {
				await message.channel.send('Would you like to log mod commands? (Yes or No)').then(() => {
					message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
						.then(collected => {
							if (collected.first().content.toLowerCase() === 'yes') {
								modLogging = true;
							} else if (collected.first().content.toLowerCase() === 'no') {
								modLogging = false;
							} else {
								return message.reply('that is not a valid reply');
							}
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
				msgLoggingFunc();
			}
		}
		async function modChannelFunc(modFlag) {
			if (modFlag) {
				await message.channel.send('What is your moderation channel? (if applicable)').then(() => {
					message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
						.then(collected => {
							modChannel = collected.first().content.match(/\d+/)[0];
							modChannelClean = collected.first().content;
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
				msgLoggingFunc();
			}
		}
		async function msgLoggingFunc() {
			await message.channel.send('Would you like to log messages? (Yes or No)').then(() => {
				message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
					.then(collected => {
						if (collected.first().content.toLowerCase() === 'yes') {
							msgLogging = true;
						} else if (collected.first().content.toLowerCase() === 'no') {
							msgLogging = false;
						} else {
							return message.reply('that is not a valid reply');
						}
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
			if (logFlag) {
				await message.channel.send('What is your message logging channel? (if applicable)').then(() => {
					message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
						.then(collected => {
							msgLogChannel = collected.first().content.match(/\d+/)[0];
							logChannelClean = collected.first().content;
							noPrefixFunc();
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
				noPrefixFunc();
			}
		}
		async function noPrefixFunc() {
			await message.channel.send('Would you like the commands with no prefix? (Yes or No)').then(() => {
				message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
					.then(collected => {
						if (collected.first().content.toLowerCase() === 'yes') {
							noPrefix = true;
						} else if (collected.first().content.toLowerCase() === 'no') {
							noPrefix = false;
						} else {
							return message.reply('that is not a valid reply');
						}
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
		}
		async function configFunc() {
			try {
				await sConfig.create({
					guild_id: message.guild.id,
					prefix: prefix,
					mod_channel: modChannel,
					msgLog_channel: msgLogChannel,
					mod_commands: modCommands,
					mod_logging: modLogging,
					msg_logging: msgLogging,
					noPrefix_commands: noPrefix,
				});
			} catch(e) {
				if (e.name === 'SequelizeUniqueConstraintError') {
					try {
						const upConfig = await sConfig.update({
							prefix: prefix,
							mod_channel: modChannel,
							msgLog_channel: msgLogChannel,
							mod_commands: modCommands,
							mod_logging: modLogging,
							msg_logging: msgLogging,
							noPrefix_commands: noPrefix,
						},
						{
							where: { guild_id: message.guild.id },
						});
						if (upConfig > 0) {
							console.log(`Updated server config on ${message.guild.name}`);
						}
					} catch(err) {
						console.error(err);
					}
				}
			}

			const configEmbed = new Discord.MessageEmbed()
				.setTitle('Server Config')
				.setDescription(`Prefix: ${prefix}

				Mod Channel: ${modChannelClean}

				Log Channel: ${logChannelClean}

				Mod Commands: ${modCommands}

				Mod Logging: ${modLogging}

				Message Logging: ${msgLogging}
				
				No Prefix Commands ${noPrefix}`);
			message.channel.send(configEmbed);
		}
	},
};