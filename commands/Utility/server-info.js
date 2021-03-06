// Copyright (C) 2021 Brody Jagoe

const Discord = require('discord.js');

module.exports = {
	name: 'server-info',
	aliases: ['serverinfo', 'sinfo'],
	description: 'Get information about the server',
	module: 'Utility',
	async execute(message) {
		const server = message.guild;
		const desc = server.description || 'None';
		const vanity = server.vanityURLCode || 'None';
		const textChan = server.channels.cache.filter(c => c.type == 'text');
		const voiceChan = server.channels.cache.filter(c => c.type == 'voice');
		const textSize = textChan.size;
		const voiceSize = voiceChan.size;
		const totalSize = textSize + voiceSize;

		const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });
		const [{ value: month },, { value: day },, { value: year }] = dateTimeFormat.formatToParts(server.createdAt);

		const infoEmbed = new Discord.MessageEmbed()
			.setAuthor(server.name, server.iconURL({ dynamic: true }))
			.setThumbnail(server.bannerURL())
			.setColor('BLUE')
			.setDescription(`**Description:** ${desc}
**Owner:** ${server.owner.user.tag} (${server.ownerID})

**Members:** ${server.memberCount} | **Vanity URL:** ${vanity} | **Emoji Count:** ${server.emojis.cache.size}
**Region:** ${server.region} | **Verification Level:** ${server.verificationLevel}

**Channels:** ${totalSize} (Text: ${textSize} | Voice: ${voiceSize})

**Number of Boosts:** ${server.premiumSubscriptionCount} | **Boost Level:** ${server.premiumTier}`)
			.setFooter(`Created On: ${day} ${month} ${year}`);
		message.channel.send(infoEmbed);
	},
};

/*
Description
Owner (Owner ID)
Vanity URL
Region
Verification Level
Channels (Text, Voice)
Emoji Count
# of Boosts
Boost Level

Footer:
Created At
*/