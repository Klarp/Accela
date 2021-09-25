// Copyright (C) 2021 Brody Jagoe

const { Permissions } = require('discord.js');
const { sConfig } = require('../../dbObjects');

module.exports = {
	name: 'join-thread',
	aliases: ['jt', 'join', 'jointhread'],
	description: 'Joins a thread for testing',
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
				if (thread.type === 'GUILD_PUBLIC_THREAD') {
					if (!message.guild.me.permissions.has(Permissions.FLAGS.USE_PUBLIC_THREADS)) return message.reply('I do not have permission to use public threads!');
					if (thread.joinable) {
						await thread.join();

						message.reply(`Joined thread: "${thread.name}" in ${message.channel.name}`);
						console.log(`Joined thread: "${thread.name}" in ${message.channel.name}`);
					} else {
						message.reply('I could not join the thread or I\'m already in it');
					}
				} else {
					if (!message.guild.me.permissions.has(Permissions.FLAGS.USE_PRIVATE_THREADS)) return message.reply('I do not have permission to use public threads!');
					if (thread.joinable) {
						await thread.join();

						message.reply(`Joined thread: "${thread.name}" in ${message.channel.name}`);
						console.log(`Joined thread: "${thread.name}" in ${message.channel.name}`);
					} else {
						message.reply('I could not join the thread or I\'m already in it');
					}
				}
			} else {
				message.reply('You do not have permission to do this');
			}
		} else {
			message.reply(`Could not find a thread named ${threadName}`);
		}
	},
};