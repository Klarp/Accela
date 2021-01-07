module.exports = {
	name: 'avatar',
	aliases: ['icon', 'pfp'],
	description: 'Gets the avatar of the user',
	module: 'Utility',
	usage: '<user>',
	execute(message, args) {
		let menUser = message.mentions.users.first();
		let memberFlag = false;
		if (!menUser && args[0]) {
			memberFlag = true;
			menUser = message.guild.member(args[0]).user;
		}
		if (!menUser && memberFlag) menUser = message.user;

		if(menUser) {
			message.channel.send(menUser.displayAvatarURL({ size:4096, dynamic:true }));
		} else {
			message.channel.send(message.author.displayAvatarURL({ size:4096, dynamic:true }));
		}
	},
};