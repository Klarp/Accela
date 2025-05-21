const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
	owner: true,
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads the command')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to reload')
				.setRequired(true),
		),
	async execute(interaction) {
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const client = interaction.client;

		let commandPath = null;

		const foldersPath = path.join(__dirname, '..');
		const commandFolders = fs.readdirSync(foldersPath);

		for (const folder of commandFolders) {
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file);
				try {
					const command = require(filePath);
					if('data' in command && 'execute' in command) {
						if (command.data.name === commandName) {
							commandPath = filePath;
							break;
						}
					}
				} catch (err) {
					console.warn(`Failed to load ${filePath}: ${err.message}`);
				}
			}
			if (commandPath) break;
		}

		if (!commandPath) {
			return interaction.reply(`There is no command with name \`${commandName}\``);
		}

		try {
			delete require.cache[require.resolve(commandPath)];
			const newCommand = require(commandPath);
			client.commands.set(newCommand.data.name, newCommand);
			await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded successfully`);
		} catch (err) {
			console.error(err);
			await interaction.reply({ content: `There was an error while reloading command \`${commandName}\`:\n\`${err.message}\``,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};