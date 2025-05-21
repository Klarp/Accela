const { SlashCommandBuilder } = require('discord.js');
const { getAniPage, getMalPage } = require('../../utils/mediaFetchers');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('manga')
		.setDescription('Finds information on a manga')
		.addSubcommand(subcommand =>
			subcommand.setName('anilist')
				.setDescription('Find information about a manga on AniList')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('The name of the manga')
						.setRequired(true),
				)
				.addStringOption(option =>
					option.setName('status')
						.setDescription('The status of the manga')
						.addChoices(
							{ name: 'Finished', value: 'FINISHED' },
							{ name: 'Releasing', value: 'RELEASING' },
							{ name: 'Not Yet Released', value: 'NOT_YET_RELEASED' },
							{ name: 'Cancelled', value: 'CANCELLED' },
							{ name: 'Hiatus (rip)', value: 'HIATUS' },
						),
				)
				.addStringOption(option =>
					option.setName('format')
						.setDescription('The format of the manga')
						.addChoices(
							{ name: 'Manga', value: 'MANGA' },
							{ name: 'Novel', value: 'NOVEL' },
							{ name: 'One Shot', value: 'ONE_SHOT' },
						),
				),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('myanimelist')
				.setDescription('Find information about a manga on MyAnimeList')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('The name of the manga')
						.setRequired(true),
				)
				.addStringOption(option =>
					option.setName('status')
						.setDescription('The status of the manga')
						.addChoices(
							{ name: 'Publishing', value: 'publishing' },
							{ name: 'Complete', value: 'complete' },
							{ name: 'Hiatus (rip)', value: 'hiatus' },
							{ name: 'Discontinued', value: 'discontinued' },
							{ name: 'Upcoming', value: 'upcoming' },
						),
				)
				.addStringOption(option =>
					option.setName('format')
						.setDescription('The format of the manga')
						.addChoices(
							{ name: 'Manga', value: 'manga' },
							{ name: 'Novel', value: 'novel' },
							{ name: 'Light Novel', value: 'lightnovel' },
							{ name: 'One Shot', value: 'oneshot' },
							{ name: 'Doujin', value: 'doujin' },
							{ name: 'Manhwa', value: 'manhwa' },
							{ name: 'Manhua', value: 'manhua' },
						),
				),
		),
	async execute(interaction) {
		const mediaName = interaction.options.getString('name');
		const mediaStatus = interaction.options.getString('status');
		const mediaFormat = interaction.options.getString('format');

		const options = {
			search: mediaName,
			type: 'MANGA',
		};

		if (mediaStatus) options.status = mediaStatus;
		if (mediaFormat) options.format = mediaFormat;

		interaction.options.getSubcommand() === 'anilist'
			? getAniPage(interaction, options)
			: getMalPage(interaction, options);
	},
};