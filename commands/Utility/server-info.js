// Copyright (C) 2021 Brody Jagoe

const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'server-info',
	aliases: ['serverinfo', 'sinfo'],
	description: 'Get information about the server',
	module: 'Utility',
	async execute(message) {
		const server = message.guild;
		const desc = server.description || 'None';
		const vanity = server.vanityURLCode || 'None';
		const textChan = server.channels.cache.filter(c => c.type == 'GUILD_TEXT');
		const voiceChan = server.channels.cache.filter(c => c.type == 'GUILD_VOICE');
		const textSize = textChan.size;
		const voiceSize = voiceChan.size;
		const totalSize = textSize + voiceSize;
		const owner = await server.fetchOwner();

		let boost;
		let verLevel;

		if (server.premiumTier === 'NONE') {
			boost = 'None';
		} else if (server.premiumTier === 'TIER_1') {
			boost = '1';
		} else if (server.premiumTier === 'TIER_2') {
			boost = '2';
		} else {
			boost = '3';
		}

		if (server.verificationLevel === 'NONE') {
			verLevel = 'None';
		} else if (server.verificationLevel === 'LOW') {
			verLevel = 'Low';
		} else if (server.verificationLevel === 'MEDIUM') {
			verLevel = 'Medium';
		} else if (server.verificationLevel === 'HIGH') {
			verLevel = ' High';
		} else {
			verLevel = 'Very High';
		}

		const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });
		const [{ value: month },, { value: day },, { value: year }] = dateTimeFormat.formatToParts(server.createdAt);

		const infoEmbed = new MessageEmbed()
			.setAuthor(server.name, server.iconURL({ dynamic: true }))
			.setThumbnail(server.bannerURL())
			.setColor('BLUE')
			.setDescription(`**Owner:** ${owner.user.tag} (${server.ownerId})

**Members:** ${server.memberCount} | **Vanity URL:** ${vanity}
**Verification Level:** ${verLevel} | **Emoji Count:** ${server.emojis.cache.size}

**Description:** ${desc}

**Channels:** ${totalSize} (Text: ${textSize} | Voice: ${voiceSize})

**Number of Boosts:** ${server.premiumSubscriptionCount} | **Boost Level:** ${boost}`)
			.setFooter(`Created On: ${day} ${month} ${year}`);
		message.channel.send({ embeds: [infoEmbed] });
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