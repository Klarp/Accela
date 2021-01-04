module.exports = {
	name: 'avatar',
	aliases: ['icon', 'pfp'],
	description: 'Gets the avatar of the user',
	module: 'Utility',
	usage: '<user>',
	execute(message, args) {
		let menUser = message.mentions.users.first();
		if (args[0] && !menUser) menUser = message.guild.member(args[0]).user;

		if(menUser) {
			message.channel.send(menUser.displayAvatarURL({ size:4096, dynamic:true }));
		} else {
			message.channel.send(message.author.displayAvatarURL({ size:4096, dynamic:true }));
		}
	},
};