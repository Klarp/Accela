const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const { Users } = require('./dbObjects');
const checkPerm = require('./utils/checkPerm.js');
const mapDetect = require('./utils/mapDetect');
const { Muted } = require('./dbObjects');
const modAction = require('./utils/modAction');
const osuUsers = new Discord.Collection();
const client = new Discord.Client();

exports.Client = client;

client.commands = new Discord.Collection();
const modules = ['Admin', 'osu!', 'Utility'];

const cooldowns = new Discord.Collection();

modules.forEach(c => {
	fs.readdir(`./commands/${c}`, (err, files) => {
		if (err) throw err;

		console.log(`[Command Logs] Loaded ${files.length} commands of module ${c}`);

		files.forEach(f => {
			const props = require(`./commands/${c}/${f}`);

			client.commands.set(props.name, props);
		});
	});
});

client.once('ready', async () => {
	const storedUsers = await Users.findAll();
	storedUsers.forEach(u => osuUsers.set(u.user_id, u));
	client.user.setPresence({ activity: { name: 'lets all love lain' }, status: 'online' })
		.catch(console.error);

	console.log(`${client.user.tag} has entered The Wired`);
});

client.on('message', message => {
	if (message.embeds[0]) {
		if (!message.embeds[0].url) {
			return;
		} else if (message.embeds[0].url.includes('https://osu.ppy.sh/b/')) {
			const mapId = message.embeds[0].url;
			exports.mapID = mapId;
		}
	}


	const filter = m => m.content.includes('https://osu.ppy.sh/b/') || m.content.includes('https://osu.ppy.sh/beatmapsets/');
	const collector = message.channel.createMessageCollector(filter, { time: 15000 });
	collector.on('collect', m => mapDetect(m));

	if (!message.author.bot) {
		const konCha = client.emojis.cache.get('688169982223319072');
		const yepPride = client.emojis.cache.get('706929594028130304');
		const YEP = client.emojis.cache.get('734159200564936714');
		const lowMsg = message.content.toLowerCase();

		if (lowMsg == 'hey accela') message.reply(`Hey there! ${konCha}`);
		if (lowMsg.includes('gay')) message.react(yepPride.id);
		if (lowMsg.includes('cock')) message.channel.send(`${YEP}`);
	}

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.perms) {
		if (!checkPerm(message.member, command.perms)) return message.reply('Insufficient permissions.');
	}

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't put any arguments, ${message.author}!`;
		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if(!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);


	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('Error: unable to execute command!');
	}
});

client.on('messageDelete', message => {
	if (client.channels.cache.get('734216663054024734')) {
		const delEmbed = new Discord.MessageEmbed()
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.setColor('RED')
			.setTitle('Message Deleted')
			.setDescription(message)
			.setTimestamp();
		client.channels.cache.get('734216663054024734').send(delEmbed);
	}
});


/*
client.on('messageUpdate', async (oldMsg, newMsg) => {
	console.log(oldMsg.content);
	console.log(newMsg.content);
	const editEmbed = new Discord.MessageEmbed()
		.setAuthor(`${newMsg.author.tag} (${newMsg.author.id})`, newMsg.author.displayAvatarURL())
		.setColor('BLUE')
		.setTitle('Message Edited')
		.addField('Old Message', oldMsg.content)
		.addField('New Message', newMsg.content)
		.setTimestamp();
	client.channels.cache.get('734216663054024734').send(editEmbed);
});
*/


client.on('guildBanAdd', (guild, user) => {
	if (guild.id === '687858540425117755') {
		const banEmbed = new Discord.MessageEmbed()
			.setThumbnail(user.displayAvatarURL())
			.setTitle('User Banned')
			.setDescription(`${user.tag} (${user.id})`);
		guild.channels.cache.get('688417816818483211').send(banEmbed);
	}
});

client.on('guildBanRemove', async (guild, user) => {
	if (guild.id === '687858540425117755') {
		const unbanEmbed = new Discord.MessageEmbed()
			.setThumbnail(user.displayAvatarURL())
			.setTitle('User Unbanned')
			.setDescription(`${user.tag} (${user.id})`);
		guild.channels.cache.get('688417816818483211').send(unbanEmbed);
	}
	const muteUser = await Muted.findOne({ where: { user_id: user.id } });
	if (!muteUser) return;
	try {
		const unMuted = await Muted.destroy({ where: { user_id: user.id } });
		if (!unMuted) return console.log(`Failed to unmute ${user.username}`);
	}catch(e) {
		console.error(e);
	}
});

client.on('guildMemberAdd', async (member) => {
	const muteUser = await Muted.findOne({ where: { user_id: member.id } });
	if (!muteUser) return;
	if (member.bannable) {
		member.send(`You have been banned from ${member.guild.name}! Reason: Mute Evasion`).then (() => {
			member.ban({ days: 1, reason: 'Mute Evasion' }).catch(err => console.log(err));
		});
	} else {
		return console.log(`Could not ban ${member.displayName}.`);
	}
	modAction(client.user, member, 'Ban', 'Mute Evasion');
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

client.login(token);