const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'top-playing',
	aliases: ['topplaying', 'tplaying'],
	description: 'Shows top playing game list in the server',
	module: 'Owner',
	owner: true,
	execute(message) {
		const topEmbed = new MessageEmbed()
			.setTitle('Top 10 games being played right now:')
			.setColor('#af152a')
			.setDescription(`1. osu! with 292 players
			2. League of Legends with 92 players
			3. ROBLOX with 69 players
			4. Genshin Impact with 54 players
			5. Rocket League with 52 players
			6. Counter-Strike: Global Offensive with 46 players
			7. Badlion Client with 32 players
			8. Minecraft with 31 players
			9. VALORANT with 30 players
			10. Fortnite with 27 players`);

		message.channel.send(topEmbed);
	},
};