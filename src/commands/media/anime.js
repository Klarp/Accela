const { SlashCommandBuilder } = require('discord.js');
const { getAniPage, getMalPage } = require('../../utils/mediaFetchers');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('anime')
		.setDescription('Finds information on a anime')
		.addSubcommand(subcommand =>
			subcommand.setName('anilist')
				.setDescription('Find information about a anime on AniList')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('The name of the anime')
						.setRequired(true),
				)
				.addStringOption(option =>
					option.setName('status')
						.setDescription('The status of the anime')
						.addChoices(
							{ name: 'Finished', value: 'FINISHED' },
							{ name: 'Releasing', value: 'RELEASING' },
							{ name: 'Not Yet Released', value: 'NOT_YET_RELEASED' },
							{ name: 'Cancelled', value: 'CANCELLED' },
							{ name: 'Hiatus', value: 'HIATUS' },
						),
				)
				.addStringOption(option =>
					option.setName('format')
						.setDescription('The format of the anime')
						.addChoices(
							{ name: 'TV', value: 'TV' },
							{ name: 'TV Short', value: 'TV_SHORT' },
							{ name: 'Movie', value: 'MOVIE' },
							{ name: 'Special', value: 'SPECIAL' },
							{ name: 'OVA', value: 'OVA' },
							{ name: 'ONA', value: 'ONA' },
							{ name: 'Music', value: 'MUSIC' },
						),
				),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('myanimelist')
				.setDescription('Find information about a anime on MyAnimeList')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('The name of the anime')
						.setRequired(true),
				)
				.addStringOption(option =>
					option.setName('status')
						.setDescription('The status of the anime')
						.addChoices(
							{ name: 'Airing', value: 'airing' },
							{ name: 'Complete', value: 'complete' },
							{ name: 'Upcoming', value: 'upcoming' },
						),
				)
				.addStringOption(option =>
					option.setName('format')
						.setDescription('The format of the anime')
						.addChoices(
							{ name: 'TV', value: 'tv' },
							{ name: 'Movie', value: 'movie' },
							{ name: 'OVA', value: 'ova' },
							{ name: 'Special', value: 'special' },
							{ name: 'ONA', value: 'ona' },
							{ name: 'Music', value: 'music' },
							{ name: 'CM', value: 'cm' },
							{ name: 'PV', value: 'pv' },
							{ name: 'TV Special', value: 'tv_special' },
						),
				),
		),
	async execute(interaction) {
		const mediaName = interaction.options.getString('name');
		const mediaStatus = interaction.options.getString('status');
		const mediaFormat = interaction.options.getString('format');

		const options = {
			search: mediaName,
			type: 'ANIME',
		};

		if (mediaStatus) options.status = mediaStatus;
		if (mediaFormat) options.format = mediaFormat;

		interaction.options.getSubcommand() === 'anilist'
			? getAniPage(interaction, options)
			: getMalPage(interaction, options);
	},
};