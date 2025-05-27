const { MessageFlags } = require('discord.js');
const { MediaPage } = require('../models/MediaPage');
const { DEFAULT_QUERY } = require('./constants');
const { formatSelectedOptions } = require('./formatters');
const { messageHandler } = require('./messageHandler');
const { transformData } = require('./transformData');
const { anilist } = require('anilist');
const { Marika } = require('@shineiichijo/marika');
const { anime, manga } = new Marika();


async function getMalPage(interaction, options) {
	let pageData;
	const malQuery = {
		q: options.search,
		status: options.status,
		type: options.format,
		limit: 5,
		sfw: true,
	};

	try {
		options.type === 'ANIME'
			? pageData = await anime.getAnimeSearch(malQuery)
			: pageData = await manga.getMangaSearch(malQuery);

		if (!pageData || !pageData.data || pageData.data.length === 0) {
			const selected = formatSelectedOptions(options);
			await interaction.reply(
				`No results found for "${options.search}"\n\n**With filters:**\n${selected}`,
			);
			return;
		}

		const page = new MediaPage(pageData, {
			...options,
			menuId: 'mal_menu',
			transform: (data) => transformData(data, options.type),
		});

		const content = await page.createMessage();

		await messageHandler(interaction, content, page);
	} catch(err) {
		console.error(`Failed to send information on "${options.search}":`, err);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: `An error occured while fetching information for "${options.search}"`,
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: `An error occured while fetching information for "${options.search}"`,
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}

async function getAniPage(interaction, options) {
	DEFAULT_QUERY.arguments(options);
	const fullPage = anilist.query.page({ perPage: 5 }).withMedia(DEFAULT_QUERY);

	try {
		const pageData = await fullPage.fetch();

		if (!pageData || !pageData.media || pageData.media.length === 0) {
			const selected = formatSelectedOptions(options);
			await interaction.reply(
				`No results found for "${options.search}"\n\n**With filters:**\n${selected}`,
			);
			return;
		}

		const page = new MediaPage(pageData, {
			...options,
			menuId: 'ani_menu',
		});

		const content = await page.createMessage();

		return await messageHandler(interaction, content, page);
	} catch(err) {
		console.error(`Failed to send information on "${options.search}":`, err);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: `An error occured while fetching information for "${options.search}"`,
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: `An error occured while fetching information for "${options.search}"`,
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}

module.exports = { getAniPage, getMalPage };