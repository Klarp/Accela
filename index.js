const fs = require('fs');
const Discord = require('discord.js');
const axios = require('axios');

const { token, owners, AuthToken } = require('./config.json');
const { Users, Muted, sConfig } = require('./dbObjects');
const checkPerm = require('./utils/checkPerm.js');
const mapDetect = require('./utils/mapDetect');
const modAction = require('./utils/modAction');

const osuUsers = new Discord.Collection();
const configs = new Discord.Collection();
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

const activities_list = [
	'osu!',
	'Let\'s All Love Lain',
	'PHANTOMa',
	'The Wired',
	'at Phil\'s house',
	'osu! lazer',
	'at Cyberia',
	'h-help im trapped here',
	'vote @ https://discord.ly/accela',
];

client.once('ready', async () => {
	const storedUsers = await Users.findAll();
	storedUsers.forEach(u => osuUsers.set(u.user_id, u));

	const serverConfigs = await sConfig.findAll();
	serverConfigs.forEach(s => configs.set(s.guild_id, s));

	setInterval(() => {
		const index = Math.floor(Math.random() * (activities_list.length - 1) + 1);
		client.user.setActivity(activities_list[index]);
	}, 30000);

	let userCount = 0;

	client.guilds.cache
		.each(guild => userCount += guild.memberCount);

	axios.post(
		`https://discordbotlist.com/api/v1/bots/${client.user.id}`,
		{
			'users': userCount,
			'guilds': client.guilds.cache.size,
		},
		{
			'Authentication': AuthToken,
		},
	)
		.then((err, res) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log(res.status);
			console.log(res.statusText);
		})
		.catch(function(error) {
			if (error.response) {
				console.log(error.response.status);
			} else if (error.request) {
				console.log(error.request);
			} else {
				console.log('Error', error.message);
			}
			console.log(error.config);
		});

	console.log(`${client.user.tag} has entered The Wired`);
});

client.on('message', async message => {
	if (message.embeds[0]) {
		if (!message.embeds[0].url) {
			return;
		} else if (message.embeds[0].url.includes('https://osu.ppy.sh/b/')) {
			const mapId = message.embeds[0].url;
			exports.mapID = mapId;
		}
	}

	let serverConfig;

	if (message.channel.type !== 'dm') {
		serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
	}

	let prefix = '>>';
	let modFlag;
	let noPrefixFlag;

	if (serverConfig) {
		prefix = serverConfig.get('prefix');
		modFlag = serverConfig.get('mod_commands');
		noPrefixFlag = serverConfig.get('noPrefix_commands');
	}

	if (!message.author.bot) {
		if (noPrefixFlag) {
			if (message.content.startsWith('https://osu.ppy.sh/b/') || message.content.startsWith('https://osu.ppy.sh/beatmapsets/')) {
				mapDetect(message);
			}
			const konCha = client.emojis.cache.get('688169982223319072');
			const yepPride = client.emojis.cache.get('706929594028130304');
			const YEP = client.emojis.cache.get('734159200564936714');
			const lowMsg = message.content.toLowerCase();

			if (lowMsg == 'hey accela') message.reply(`Hey there! ${konCha}`);
			if (lowMsg.includes('gay')) message.react(yepPride.id);
			if (lowMsg.includes('cock')) message.channel.send(`${YEP}`);
		}
	}

	if (message.author.bot) return;

	if (!message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	if (!commandName) return;

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.modCmd) {
		if (!modFlag) return;
	}

	if (command.owner) {
		let ownerCheck = false;
		owners.forEach(owner => {
			if (owner == message.author.id) ownerCheck = true;
		});
		if (!ownerCheck) return;
	}

	if (command.perms) {
		if (!checkPerm(message.member, command.perms)) return;
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
		message.reply('Error: OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!');
	}
});

client.on('messageDelete', async message => {
	const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
	let logFlag = false;
	if (serverConfig.get('msg_logging')) {
		logFlag = serverConfig.get('msg_logging');
	}
	const logChannel = serverConfig.get('msgLog_channel');

	if (logFlag) {
		const delEmbed = new Discord.MessageEmbed()
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.setColor('RED')
			.setTitle('Message Deleted')
			.setDescription(message)
			.setTimestamp();
		client.channels.cache.get(logChannel).send(delEmbed);
	}
});

client.on('guildCreate', async (guild) => {
	try {
		await sConfig.create({
			guild_id: guild.id,
			prefix: '>>',
			mod_channel: '',
			msgLog_channel: '',
			mod_commands: false,
			mod_logging: false,
			msg_logging: false,
			noPrefix_commands: false,
		});
		console.log(`Default config made for ${guild.name}`);
	} catch(e) {
		if (e.name === 'SequelizeUniqueConstraintError') {
			console.log(`Using old config for ${guild.name}`);
		}
		console.error(e);
	}
});

client.on('guildBanAdd', async (guild, user) => {
	const serverConfig = await sConfig.findOne({ where: { guild_id: guild.id } });
	const logFlag = serverConfig.get('mod_logging');
	const modChannel = serverConfig.get('mod_channel');

	if (logFlag) {
		const banEmbed = new Discord.MessageEmbed()
			.setThumbnail(user.displayAvatarURL())
			.setTitle('User Banned')
			.setDescription(`${user.tag} (${user.id})`);
		guild.channels.cache.get(modChannel).send(banEmbed);
	}
});

client.on('guildBanRemove', async (guild, user) => {
	const serverConfig = await sConfig.findOne({ where: { guild_id: guild.id } });
	const logFlag = serverConfig.get('mod_logging');
	const modChannel = serverConfig.get('mod_channel');

	if (logFlag) {
		const unbanEmbed = new Discord.MessageEmbed()
			.setThumbnail(user.displayAvatarURL())
			.setTitle('User Unbanned')
			.setDescription(`${user.tag} (${user.id})`);
		guild.channels.cache.get(modChannel).send(unbanEmbed);
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
	const muteRole = member.guild.roles.cache.find(r => r.name === 'muted');
	member.roles.add(muteRole.id).then(() => {
		member.send(`You have been muted in ${member.guild.name}! Reason: Mute Evasion`);
	});
	modAction(client.user, member, 'Mute', 'Mute Evasion');
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

client.login(token);