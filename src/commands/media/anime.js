import { SlashCommandBuilder } from 'discord.js';
import { getAniPage } from '../../utils/mediaFetchers.js';

export default {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('anime')
		.setDescription('Finds information on a anime (AniList)')
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
	async execute(interaction) {
		const mediaName = interaction.options.getString('name');
		const mediaStatus = interaction.options.getString('status');
		const mediaFormat = interaction.options.getString('format');

		const options = {
			search: mediaName,
			type: 'ANIME',
			isAdult: false,
		};

		if (mediaStatus) options.status = mediaStatus;
		if (mediaFormat) options.format = mediaFormat;

		await getAniPage(interaction, options);
	},
};