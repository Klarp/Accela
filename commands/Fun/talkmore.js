module.exports = {
	name: 'talk',
	aliases: 'talkmore',
	description: 'How to level up on the osu! discord',
	module: 'Fun',
	osuDiscord: true,
	cooldown: 5,
	execute(message) {
		message.channel.send('https://cdn.discordapp.com/attachments/780131105725480972/792982063707848754/talkmore.gif');
	},
};