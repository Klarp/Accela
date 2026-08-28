const { SlashCommandBuilder } = require('discord.js');
const { wiki_links } = require('./constants');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wiki')
		.setDescription('Search common topics on the osu! wiki')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('common')
				.setDescription('osu! wiki pages')
				.addStringOption((option) =>
					option
						.setName('page')
						.setDescription('Choose a wiki page')
						.setRequired(true)
						.addChoices(
							{ name: 'Main Page', value: 'main' },
							{ name: 'osu! Rules', value: 'rules' },
							{ name: 'Installation Instructions', value: 'install' },
							{ name: 'Help Page', value: 'help' },
							{ name: 'osu! FAQ', value: 'faq' },
							{ name: 'osu! Guides', value: 'guides' },
							{ name: 'How to help out osu!', value: 'howtohelp' },
							{ name: 'osu! Contacts', value: 'contacts' },
						),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('report')
				.setDescription('osu! report wiki pages')
				.addStringOption((option) =>
					option
						.setName('page')
						.setDescription('Choose a wiki page')
						.setRequired(true)
						.addChoices(
							{ name: 'Reporting Bad Behaviour', value: 'bad_behaviour' },
							{ name: 'Reporting Abuse', value: 'abuse' },
							{ name: 'Reporting Cheating', value: 'cheat' },
						),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('account_support')
				.setDescription('osu! account support wiki pages')
				.addStringOption((option) =>
					option
						.setName('page')
						.setDescription('Choose a wiki page')
						.setRequired(true)
						.addChoices(
							{ name: 'Account Support Team', value: 'account' },
							{ name: 'Account Registration', value: 'register' },
							{ name: 'Account Silences', value: 'silences' },
							{ name: 'Account Restrictions', value: 'restrictions' },
						),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('restrictions')
				.setDescription('Help with osu! account restrictions')
				.addStringOption((option) =>
					option
						.setName('page')
						.setDescription('Choose a wiki page')
						.setRequired(true)
						.addChoices(
							{ name: 'What to do if your account has been restricted', value: 'what' },
							{ name: 'Reasons why your account could have been restricted', value: 'why' },
							{ name: 'What to do while awaiting cooldown before appealing', value: 'while_on_cooldown' },
							{ name: 'How to appeal', value: 'appeal' },
							{ name: 'What to do once an appeal is granted', value: 'appeal_granted' },
							{ name: 'What to do once an appeal is denied', value: 'appeal_denied' },
							{ name: 'What happens if this isn\'t your first time appealing', value: 'subsequent_appeal' },
							{ name: 'What to do if your emails are ignored/handled unfairly', value: 'appeal_review' },
							{ name: 'Common restriction reasons and cooldowns', value: 'reasons' },
						),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('mapping')
				.setDescription()
				.setRequired(true)
				.addChoices(
					{ name: 'How to submit a beatmap (stable)', value: 'beatmap_stable' }, 
					{ name: 'How to submit a beatmap (lazer)', value: 'beatmap_lazer' },
					{ name: 'Beatmap Modding', value: 'modding' },
					{ name: 'Beatmap ranking procecure', value: 'rank_procedure' },
					{ name: 'General ranking criteria', value: 'rank_criteria' },
					{ name: 'Simplified ranking criteria', value: 'simple_criteria' },
					{ name: 'osu!std ranking criteria', value: 'std_criteria' },
					{ name: 'osu!mania ranking criteria', value: 'mania_criteria' },
					{ name: 'osu!taiko ranking criteria', value: 'taiko_criteria' },
					{ name: 'osu!catch ranking criteria', value: 'catch_criteria' },
				)
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const user_option = interaction.options.getString('page');

		const url = wiki_links[subcommand]?.[user_option];

		interaction.reply(url);
	},
};