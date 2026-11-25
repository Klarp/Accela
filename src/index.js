import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Client, Collection, GatewayIntentBits } from 'discord.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
	],
});

client.commands = new Collection();
client.cooldowns = new Collection();

// Loads commands from the directory into the collection
async function loadCommands() {
	const foldersPath = path.join(__dirname, 'commands');
	const commandFolders = await fs.readdirSync(foldersPath);
	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = await fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const { default: command } = await import(pathToFileURL(filePath).href);
			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
			} else {
				throw new Error(`The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}
	return console.log('Commands loaded');
}

async function loadEvents() {
	const eventsPath = path.join(__dirname, 'events');
	const eventFiles = await fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const { default: event } = await import(pathToFileURL(filePath).href);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
	return console.log('Events loaded');
}

async function main() {
	try {
		await loadCommands();
		await loadEvents();
		await client.login(process.env.DISCORD_TOKEN);
		console.log('Logged in successfully');
	} catch (error) {
		console.error('Error on start up:', error);
		process.exitCode = 1;
	}
};

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

await main();