import { StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { createMediaInfo } from '../utils/createMediaInfo.js';

export class MediaPage {
	constructor(data, options) {
		if (!data) {
			throw new Error('Media data is required');
		}

		this.data = data?.media || [];
		this.options = options;
	}

	async createMessage(pageNumber) {
		try {
			const media = await this.getMedia(pageNumber);
			const embed = await media.buildEmbed();
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
			const label = title.romaji || title.english || title.native || 'No title';
			const truncatedLabel = label.length > 100 ? `${label.substring(0, 97)}...` : label;
			const description = title.english || title.native || 'No alternative title';
			const truncatedDescription = description.length > 100 ? `${description.substring(0, 97)}...` : description;
			return new StringSelectMenuOptionBuilder()
				.setLabel(truncatedLabel)
				.setValue(index.toString())
				.setDescription(truncatedDescription);
		});

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('ani_menu')
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

		return createMediaInfo(selectedMedia, this.options.type);
	}
}