import { Events } from 'discord.js';

export default {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Entering The Wired with ${client.user.tag}`);
	},
};