module.exports = {
	name: 'avatar',
	aliases: ['icon', 'pfp'],
	description: 'Gets the avatar of the user',
	module: 'Utility',
	usage: '<user>',
	execute(message, args) {
		const menUser = message.mentions.users.first() || message.guild.member(args[0]);

		if(menUser) {
			message.channel.send(menUser.displayAvatarURL({ size:4096, dynamic:true }));
		} else {
			message.channel.send(message.author.displayAvatarURL({ size:4096, dynamic:true }));
		}
	},
};