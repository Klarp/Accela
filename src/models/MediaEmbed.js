const { EmbedBuilder } = require('discord.js');

class MediaEmbed {
	static build({
		provider,
		providerUrl,
		providerIcon,
		color,
		title,
		url,
		thumbnail,
		description,
		footer,
	}) {
		const embed = new EmbedBuilder();

		if (provider && providerUrl && providerIcon) {
			embed.setAuthor({
				name: `${provider} [Unofficial]`,
				url: providerUrl,
				iconURL: providerIcon,
			});

			if (color) embed.setColor(color);
			if (title) embed.setTitle(title);
			if (url) embed.setURL(url);
			if (thumbnail) embed.setThumbnail(thumbnail);
			if (description) embed.setDescription(description);
			if (footer) embed.setFooter({ text: footer });

			return embed;
		}
	}
}

module.exports = { MediaEmbed };