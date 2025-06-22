const { StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { createMediaInfo } = require('../utils/createMediaInfo');

class MediaPage {
	constructor(data, options) {
		if (!data) {
			throw new Error('Media data is required');
		}

		if (!options?.menuId) {
			throw new Error('menuId is required in options');
		}

		this.data = data?.media || data?.data || [];
		this.options = options;
		this.menuId = options.menuId;
	}

	async createMessage(pageNumber) {
		try {
			let embed;
			const media = await this.getMedia(pageNumber);

			this.menuId === 'ani_menu'
				? embed = await media.buildAniEmbed()
				: embed = await media.buildMalEmbed();
			const menu = this.buildMenu();
			return { embeds: [embed], components: [menu] };
		} catch (err) {
			throw new Error('Failed to create media message', { cause: err });
		}
	}

	buildMenu() {
		if (!this.data || !Array.isArray(this.data) || this.data.length === 0) {
			throw new Error('No media available to build menu');
		}

		const mediaMenu = this.data.map((item, index) => {
			const title = item?.title || {};
			const label = title.romaji || title || 'No title';
			const truncatedLabel = label.length > 100 ? `${label.substring(0, 97)}...` : label;
			const description = item.title_english || item.title_japanese || title.english || title.native || 'No alternative title';
			const truncatedDescription = description.length > 100 ? `${description.substring(0, 97)}...` : description;
			console.log(truncatedDescription);
			return new StringSelectMenuOptionBuilder()
				.setLabel(truncatedLabel)
				.setValue(index.toString())
				.setDescription(truncatedDescription);
		});

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId(this.menuId)
			.setPlaceholder('More Results')
			.addOptions(mediaMenu);

		return new ActionRowBuilder().addComponents(selectMenu);
	}

	async getMedia(pageNumber) {
		if (!this.data || this.data.length === 0) {
			throw new Error('No media data available');
		}

		const selectedMedia = pageNumber !== undefined ? this.data[pageNumber] : this.data[0];

		if (!selectedMedia?.title) {
			throw new Error('Invalid media data: missing title');
		}

		const dataObject = this.options.transform
			? await this.options.transform(selectedMedia)
			: selectedMedia;

		return createMediaInfo(dataObject, this.options.type);
	}
}

module.exports = { MediaPage };