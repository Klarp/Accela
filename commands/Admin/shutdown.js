const Discord = require('discord.js');
const { Client } = require('../../index');
const { owners } = require('../../config.json');

module.exports = {
	name: 'shutdown',
	aliases: 'sd',
	description: 'Emergancy shutdown for the bot',
	module: 'Admin',
	owner: true,
	async execute(message) {
		let owner = false;
		function ownerCheck(id) {
			if (id === message.author.id) {
				owner = true;
			} else {
				return;
			}
		}
		owners.forEach(ownerCheck);
		if (!owner) return;
		const sdEmbed = new Discord.MessageEmbed()
			.setTitle('EMERGANCY SHUTDOWN COMMENCED')
			.setDescription('Shutting down...');
		await message.channel.send(sdEmbed);
		Client.destroy();
	},
};