const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const start = Date.now();
		await interaction.reply({ content: 'Pinging...', withResponse: true });
		const latency = Date.now() - start;
		const wsPing = interaction.client.ws.ping;
		await interaction.editReply(`**Latency:** ${latency}ms\n**WebSocket:** ${wsPing}ms`);
	},
};