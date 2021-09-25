// Copyright (C) 2021 Brody Jagoe

const { Permissions } = require('discord.js');
const { sConfig } = require('../../dbObjects');

module.exports = {
	name: 'create-thread',
	aliases: ['ct', 'create', 'createthread'],
	description: 'Creates a thread for testing',
	module: 'Admin',
	owner: true,
	async execute(message, args) {
		let prefix = '>>';
		let threadName;

		if (!message.guild.me.permissions.has(Permissions.FLAGS.USE_PRIVATE_THREADS)) return message.reply('I do not have permission to create threads!');
		if (!message.guild.me.permissions.has(Permissions.FLAGS.USE_PUBLIC_THREADS)) return message.reply('I do not have permission to create threads!');
		if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) return message.reply('You do not have permission to create threads!');

		if (message.channel.type !== 'DM') {
			const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
			if (serverConfig) {
				prefix = serverConfig.get('prefix');
			}
		}

		if (args[0]) {
			threadName = args.join(' ');
		} else {
			return message.reply(`Please specify the name of the thread \`${prefix}ct [name]\``);
		}

		const thread = await message.channel.threads.create({
			name: threadName,
			autoArchiveDuration: 60,
			reason: 'Created by Accela\'s create thread command',
		});

		message.reply(`Created thread: "${thread.name}" in ${message.channel.name}`);
		console.log(`Created thread: "${thread.name}" in ${message.channel.name}`);
	},
};