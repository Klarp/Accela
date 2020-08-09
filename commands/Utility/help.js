const { prefix } = require('../../config.json');
const checkPerm = require('../../utils/checkPerm.js');
const { owners } = require('../../config.json');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	module: 'Utility',
	aliases: ['commands'],
	usage: '[command name]',
	cooldown: 5,
	execute(message, args) {
		const data = [];
		const { commands } = message.client;
		const modules = ['Admin', 'osu!', 'Fun', 'Utility', 'Owner'];

		if (!args.length) {
			data.push('Here\'s a list of commands you can use:');
			modules.forEach(m => {
				data.push(`__${m}__`);
				commands.forEach(c => {
					if (c.module == m) {
						if (c.perms) {
							if (!checkPerm(message.member, c.perms, message)) return;
						}
						if (c.owner) {
							let ownerCheck = false;
							owners.forEach(owner => {
								if (owner == message.author.id) ownerCheck = true;
							});
							if (!ownerCheck) return;
						}
						data.push(`**${c.name}**: ${c.description}`);
					}
				});
				data.push('');
			});
			// data.push(commands.map(command => command.name).join(', '));
			data.push(`You can send \`${prefix}help [command name]\` to get info on a specific command!`);
			return message.author.send(data, { split: true })
				.then(() => {
					if (message.channel.type === 'dm') return;
					message.reply('I\'ve sent you a DM with all my commands!');
				})
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
				});
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if(!command) {
			return message.reply('that\'s not a valid command!');
		}

		data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Aliases** ${command.aliases.join(', ')}`);
		if (command.description) data.push(`**Description** ${command.description}`);
		if (command.module) data.push(`**Category:** ${command.module}`);
		if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

		data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

		message.channel.send(data, { split: true });
	},
};