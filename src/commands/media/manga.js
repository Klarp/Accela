import { SlashCommandBuilder } from 'discord.js';
import { getAniPage } from '../../utils/mediaFetchers.js';

export default {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('manga')
		.setDescription('Finds information on a manga (AniList)')
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
	async execute(interaction) {
		const mediaName = interaction.options.getString('name');
		const mediaStatus = interaction.options.getString('status');
		const mediaFormat = interaction.options.getString('format');

		const options = {
			search: mediaName,
			type: 'MANGA',
			isAdult: false,
		};

		if (mediaStatus) options.status = mediaStatus;
		if (mediaFormat) options.format = mediaFormat;

		await getAniPage(interaction, options);
	},
};