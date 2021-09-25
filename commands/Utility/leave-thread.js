// Copyright (C) 2021 Brody Jagoe

const { Permissions } = require('discord.js');
const { sConfig } = require('../../dbObjects');

module.exports = {
	name: 'leave-thread',
	aliases: ['lt', 'leave', 'leavethread'],
	description: 'Leaves a thread for testing',
	module: 'Utility',
	owner: true,
	async execute(message, args) {
		let prefix = '>>';
		let threadName;

		if (message.channel.type !== 'DM') {
			const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
			if (serverConfig) {
				prefix = serverConfig.get('prefix');
			}
		}

		if (args[0]) {
			threadName = args.join(' ');
		} else {
			return message.reply(`Please specify the name of the thread \`${prefix}jt [name]\``);
		}

		const thread = await message.channel.threads.cache.find(x => x.name === threadName);

		if (thread) {
			if (thread.ownerId === message.author.id || message.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
				await thread.leave();

				message.reply(`Left thread: "${thread.name}" in ${message.channel.name}`);
				console.log(`Left thread: "${thread.name}" in ${message.channel.name}`);
			} else {
				message.reply('You do not have permission to do this');
			}
		} else {
			message.reply(`Could not find a thread named ${threadName}`);
		}
	},
};