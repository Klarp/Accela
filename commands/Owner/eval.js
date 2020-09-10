const { MessageEmbed } = require('discord.js');
const { inspect } = require('util');
const { Client } = require('../../index');

module.exports = {
	name: 'eval',
	description: 'Runs client side code',
	module: 'Owner',
	owner: true,
	args: true,
	usage: '<code>',
	execute(message, args) {
		const channel = message.channel;
		const query = args.join(' ');
		const evalEmbed = new MessageEmbed();
		const code = (lang, eCode) =>
			(`\`\`\`${lang}\n${String(eCode).slice(0, 1000) + (eCode.length >= 1000 ? '...' : '')}\n\`\`\``).replace(Client.token, '*'.repeat(Client.token.length));

		try {
			const evald = eval(query);
			const res = typeof evald === 'string' ? evald : inspect(evald, { depth: 0 });

			evalEmbed
				.addField('Result', code('js', res));

			if (!res || (!evald && evald !== 0)) {
				evalEmbed.setColor('RED');
			} else {
				evalEmbed
					.addField('Type', code('css', typeof evald))
					.setColor('GREEN');
			}
		} catch (error) {
			evalEmbed
				.addField('Error', code('js', error))
				.setColor('RED');
		} finally {
			channel.send(evalEmbed).catch(error => {
				channel.send(`Error: ${error.message}`);
			});
		}
	},
};