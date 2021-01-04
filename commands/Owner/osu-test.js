const { MessageEmbed } = require('discord.js');
const { Users } = require('../../dbObjects');

module.exports = {
	name: 'osu-test',
	aliases: ['osutest', 'testosu'],
	description: 'Tests osu! commands',
	module: 'Owner',
	owner: true,
	async execute(message, args) {
		let member;

		if (message.mentions.members) member = message.mentions.members.first();
		if (args[0] && !member) member = message.guild.member(args[0]).user;
		if (!member) message.member;

		const user = await Users.findOne({ where: { user_id: member.id } });
		if (!user) return message.reply('Could not find user!');

		const mode = user.get('osu_mode');
		const std_rank = user.get('std_rank');
		const taiko_rank = user.get('taiko_rank');
		const ctb_rank = user.get('ctb_rank');
		const mania_rank = user.get('mania_rank');

		const searchEmbed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`)
			.setTitle(`${member.displayName}'s Info`)
			.setColor('0xff69b4')
			.setDescription(`Current Mode: ${mode}
osu!std: ${std_rank}
osu!taiko: ${taiko_rank}
osu!ctb: ${ctb_rank}
osu!mania: ${mania_rank}`);

		message.channel.send(searchEmbed);
	},
};
