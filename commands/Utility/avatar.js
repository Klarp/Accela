module.exports = {
	name: 'avatar',
	aliases: ['icon', 'pfp'],
	description: 'Gets the avatar of the user',
	module: 'Utility',
	args: false,
	usage: '<user>',
	execute(message) {
		message.channel.send('Your avatar: ' + message.author.displayAvatarURL());
	},
};