// Copyright (C) 2021 Brody Jagoe

const { Permissions } = require('discord.js');
const { sConfig } = require('../../dbObjects');

module.exports = {
	name: 'delete-thread',
	aliases: ['dt', 'delete', 'deletethread'],
	description: 'Deletes a thread for testing',
	module: 'Admin',
	owner: true,
	async execute(message, args) {
		let prefix = '>>';
		let threadName;

		if (!message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) return message.reply('I do not have permission to remove threads!');
		if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) return message.reply('You do not have permission to remove threads!');

		if (message.channel.type !== 'DM') {
			const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
			if (serverConfig) {
				prefix = serverConfig.get('prefix');
			}
		}

		if (args) {
			threadName = args.join(' ');
		} else {
			message.reply(`Please specify the thread to be deleted \`${prefix}dt [name]\``);
		}

		const thread = message.channel.threads.cache.find(x => x.name === threadName);

		if (thread) {
			await thread.delete();

			message.reply(`Deleted thread: "${thread.name}" in ${message.channel.name}`);
			console.log(`Deleted thread: "${thread.name}" in ${message.channel.name}`);
		} else {
			message.reply(`Could not find a thread named ${threadName}`);
		}
	},
};