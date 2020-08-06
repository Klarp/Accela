module.exports = {
	name: 'play',
	aliases: 'playmore',
	description: 'How to get better at osu!',
	module: 'Utility',
	cooldown: 5,
	execute(message) {
		message.channel.send('https://cdn.discordapp.com/attachments/158484765136125952/740942824341766316/play_more.gif');
	},
};