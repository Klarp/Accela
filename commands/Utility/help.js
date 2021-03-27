const { prefix } = require('../../config.json');
const { checkPerm } = require('../../utils');
const { owners } = require('../../config.json');
const { MessageEmbed } = require('discord.js');
const Sentry = require('../../log');

function ucFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
	name: 'help',
	aliases: ['commands'],
	description: 'Lists all commands or info about a specific command',
	module: 'Utility',
	usage: '[command]',
	cooldown: 5,
	execute(message, args) {
		const data = [];
		const { commands } = message.client;
		const modules = ['admin', 'osu!', 'fun', 'utility', 'owner'];

		if (!args.length) {
			const helpEmbed = new MessageEmbed()
				.setAuthor(message.client.user.tag, message.client.user.displayAvatarURL())
				.setTitle('Command Directory')
				.addField('Admin', `\`${prefix}help admin\``, true)
				.addField('osu!', `\`${prefix}help osu!\``, true)
				.addField('Fun', `\`${prefix}help fun\``, true)
				.addField('Utility', `\`${prefix}help utility\``, true)
				.setFooter(`You can use ${prefix}help [command name] to get info on a specific command!`);

			return message.channel.send(helpEmbed);
		}

		const name = args[0].toLowerCase();
		const nameU = ucFirst(name);
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			if (modules.includes(name)) {
				if (name === 'owner') {
					let ownerCheck = false;
					owners.forEach(owner => {
						if (owner === message.author.id) ownerCheck = true;
					});
					if (!ownerCheck) return;
				}
				data.push(`**__${nameU} Commands__**\n`);

				commands.forEach(c => {
					if (c.module === nameU) {
						if (c.perms) {
							if (!checkPerm(message.member, c.perms, message)) return;
						}

						if (c.owner) {
							let ownerCheck = false;
							owners.forEach(owner => {
								if (owner === message.author.id) ownerCheck = true;
							});
							if (!ownerCheck) return;
						}

						if (c.osuDiscord) {
							if (!message.guild) return;
							if (message.guild.id !== '98226572468690944') return;
						}

						data.push(`**${c.name}**: ${c.description}`);
					}
				});
				data.push('');
				data.push(`You can send \`${prefix}help [command name]\` to get info on a specific command!`);
				return message.author.send(data, { split: true })
					.then(() => {
						if (message.channel.type === 'dm') return;
						message.reply('I\'ve sent you a DM with the commands!');
					})
					.catch(error => {
						Sentry.captureException(error);
						console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
						message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
					});
			}
		} else {
			data.push(`**Name:** ${command.name}`);

			let alias = 'None';
			let description = 'None';
			let module = 'None';
			let usage = '';

			if (command.aliases) {
				if (command.aliases.isArray) {
					alias = command.aliases.join(', ');
				} else {
					alias = command.aliases;
				}
			}

			if (command.description) description = command.description;
			if (command.module) module = command.module;
			if (command.usage) usage = command.usage;

			data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

			const commandEmbed = new MessageEmbed()
				.setTitle(`${ucFirst(command.name)} Command`)
				.setDescription(`**Aliases:** ${alias}

**Description:** ${description}

**Category:** ${module}

**Usage:** ${prefix}${command.name} ${usage}

**Cooldown:** ${command.cooldown || 3} second(s)`);

			message.channel.send(commandEmbed);
		}
	},
};