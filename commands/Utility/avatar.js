module.exports = {
	name: 'avatar',
	aliases: ['icon', 'pfp'],
	description: 'Gets the avatar of the user',
	module: 'Utility',
	args: false,
	usage: '<user>',
	execute(message) {
		const menUser = message.mentions.users.first();

		if(menUser) {
			message.channel.send(menUser.displayAvatarURL({ size:4096, dynamic:true }));
		} else {
			message.channel.send(message.author.displayAvatarURL({ size:4096, dynamic:true }));
		}
	},
};