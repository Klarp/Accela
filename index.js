const fs = require('fs');
const Discord = require('discord.js');
const axios = require('axios');

const { token, owners, AuthToken_BFD, AuthToken_botgg, AuthToken_DBL } = require('./config.json');
const { Users, Muted, sConfig } = require('./dbObjects');
const checkPerm = require('./utils/checkPerm.js');
const mapDetect = require('./utils/mapDetect');
const modAction = require('./utils/modAction');

const osuUsers = new Discord.Collection();
const configs = new Discord.Collection();
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
exports.Client = client;

const modules = ['Admin', 'osu!', 'Fun', 'Utility', 'Owner'];

client.on('error', error => {
	client.users.cache.get('186493565445079040').send('An error occured - check the console.');
	console.log(error);
	console.error();
});

// START COMMAND LOADING

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

// ACTIVITY LIST

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

// BOT START

client.once('ready', async () => {
	// Initialize Databases
	const storedUsers = await Users.findAll();
	storedUsers.forEach(u => osuUsers.set(u.user_id, u));

	const serverConfigs = await sConfig.findAll();
	serverConfigs.forEach(s => configs.set(s.guild_id, s));

	// Rotate through activities
	setInterval(() => {
		const index = Math.floor(Math.random() * (activities_list.length - 1) + 1);
		client.user.setActivity(activities_list[index]);
	}, 30000);

	// Default member count
	let userCount = 0;

	// Add the amount of users the bot is watching into userCount
	client.guilds.cache
		.each(guild => userCount += guild.memberCount);

	// Set bot list api headers
	const headers_DBL = {
		'Content-Type': 'application/json',
		'Authorization': AuthToken_DBL,
	};

	const headers_botgg = {
		'Content-Type': 'application/json',
		'Authorization': AuthToken_botgg,
	};

	const headers_BFD = {
		'Content-Type': 'application/json',
		'Authorization': AuthToken_BFD,
	};

	// START BOT LIST API POSTING
	// I want to make this a bit smaller in size

	// discordbotlist.com
	axios.post(
		`https://discordbotlist.com/api/v1/bots/${client.user.id}/stats`,
		{
			'users': userCount,
			'guilds': client.guilds.cache.size,
		},
		{
			headers: headers_DBL,
		},
	)
		.then((err, res) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log(`DiscordBotList.com: ${res.status}`);
		})
		.catch(function(error) {
			if (error.response) {
				console.log(`DiscordBotList.com: ${error.response.status}`);
			} else if (error.request) {
				console.log(error.request);
			} else {
				console.log('Error', error.message);
			}
		});

	// discord.bots.gg
	axios.post(
		`https://discord.bots.gg/api/v1/bots/${client.user.id}/stats`,
		{
			'guildCount': client.guilds.cache.size,
		},
		{
			headers: headers_botgg,
		},
	)
		.then((err, res) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log(`discord.bots.gg: ${res.status}`);
		})
		.catch(function(error) {
			if (error.response) {
				console.log(`discord.bots.gg: ${error.response.status}`);
			} else if (error.request) {
				console.log(error.request);
			} else {
				console.log('Error', error.message);
			}
		});

	// botsfordiscord.com
	axios.post(
		`https://botsfordiscord.com/api/bot/${client.user.id}`,
		{
			'server_count': client.guilds.cache.size,
		},
		{
			headers: headers_BFD,
		},
	)
		.then((err, res) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log(`botsfordiscord.com: ${res.status}`);
		})
		.catch(function(error) {
			if (error.response) {
				console.log(`botsfordiscord.com: ${error.response.status}`);
			} else if (error.request) {
				console.log(error.request);
			} else {
				console.log('Error', error.message);
			}
		});

	console.log(`${client.user.tag} has entered The Wired`);
});

// MESSAGE START

client.on('message', async message => {
	// Stop if message is a webhook
	if (message.webhookID) return;

	// Look for osu beatmap links in embed for compare
	if (message.embeds[0]) {
		if (!message.embeds[0].url) {
			return;
		} else if (message.embeds[0].url.includes('https://osu.ppy.sh/b/')) {
			const mapId = message.embeds[0].url;
			exports.mapID = mapId;
		}
	}

	let serverConfig;

	// If message isn't in a DM find the server config
	if (message.channel.type !== 'dm') {
		serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
	}

	let prefix = '>>';
	let modFlag;
	let noPrefixFlag;

	// Get values from the server config
	if (serverConfig) {
		prefix = serverConfig.get('prefix');
		modFlag = serverConfig.get('mod_commands');
		noPrefixFlag = serverConfig.get('noPrefix_commands');
	}

	// CURRENTLY BROKEN
	// No Prefix Functions
	if (!message.author.bot) {
		if (noPrefixFlag) {
			// Map Detection
			if (message.content.startsWith('https://osu.ppy.sh/b/') || message.content.startsWith('https://osu.ppy.sh/beatmapsets/')) {
				mapDetect(message);
			}

			// Emote Commands
			const konCha = client.emojis.cache.get('688169982223319072');
			const yepPride = client.emojis.cache.get('706929594028130304');
			const YEP = client.emojis.cache.get('734159200564936714');
			const lowMsg = message.content.toLowerCase();

			// No Prefix Commands
			if (lowMsg == 'hey accela') message.reply(`Hey there! ${konCha}`);
			if (lowMsg.includes('gay')) message.react(yepPride.id);
			if (lowMsg.includes('cock')) message.channel.send(`${YEP}`);
		}
	}

	// Stop if user is a bot
	if (message.author.bot) return;

	// Split content to find mentions
	const mentionTest = message.content.split(' ');

	// Find mentions in content
	if (mentionTest[0] === `<@!${client.user.id}>` && !mentionTest[1]) {
		message.channel.send('Hello, my current prefix is: ' + '`' + prefix + '` ' + 'if you need help use' + ' `' + prefix + 'help` for more information.');
		// Test to see if a server is running without a config made
		if (!serverConfig) {
			console.log('Running on a server with no config');
		}
	}

	// Stop if the command doesn't have a prefix (default prefix: >>)
	if (!message.content.startsWith(prefix)) return;

	// Split the content to find command arguments
	const args = message.content.slice(prefix.length).split(/ +/);
	// First argument is the command name
	const commandName = args.shift().toLowerCase();

	// Stop if no command
	if (!commandName) return;

	// Find command or it's aliases
	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	// Stop if a command wasn't found
	if (!command) return;

	// If command is a mod cmd check if mod cmds are allowed
	if (command.modCmd) {
		if (!modFlag) return;
	}

	// If command is owner only check if user is owner
	if (command.owner) {
		if (!owners.includes(message.author.id)) return;
	}

	// If command has permissions check user permissions
	if (command.perms) {
		if (!checkPerm(message.member, command.perms, message)) return;
	}

	// Stop if a command can't be run inside DMs
	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	// Error if a command that should get arguments receives none
	if (command.args && !args.length) {
		let reply = `You didn't put any arguments, ${message.author}!`;
		// If command has a set usage display it
		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	// COOLDOWN START

	// Set the cooldown after the command is run
	if(!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	// Current date
	const now = Date.now();
	// List of people who used the command
	const timestamps = cooldowns.get(command.name);
	// Get the command cooldown or default to 3 seconds
	const cooldownAmount = (command.cooldown || 3) * 1000;

	// If user recently used the command return if cooldown hasn't ended
	if (timestamps.has(message.author.id)) {
		// Find the expiration time
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		// If the expiration time isn't up reply the cooldown time
		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	// Stop the cooldown once it ends
	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	// Attempt to execute the command
	try {
		command.execute(message, args);
	} catch (error) {
		// If failed to execute console log the error
		console.error(error);
		// Creation of error embed
		const errorEmbed = new Discord.MessageEmbed()
			.setTitle('An Error Has Occurred')
			.setColor('RED')
			.setDescription(`OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!
			
Please contact @Karp#0001 if you see this message`);
		// Sends error embed on command failure
		message.channel.send(errorEmbed);
	}
});

// MESSAGE DELETE START

client.on('messageDelete', async message => {
	// Find server config
	const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
	// Start log flag on false
	let logFlag = false;
	// Get message logging value from database
	if (serverConfig.get('msg_logging')) {
		// Set log flag to server config value
		logFlag = serverConfig.get('msg_logging');
	}
	// Get log channel from server config
	const logChannel = serverConfig.get('msgLog_channel');

	// If log flag is true log the message delete
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

// NEW GUILD START

client.on('guildCreate', async (guild) => {
	// Create default config for guild
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
		// If server already had a config use the old one
		if (e.name === 'SequelizeUniqueConstraintError') {
			console.log(`Using old config for ${guild.name}`);
		}
		// Send any other errors to console
		console.error(e);
	}
});

// BAN START

client.on('guildBanAdd', async (guild, user) => {
	// Find server config
	const serverConfig = await sConfig.findOne({ where: { guild_id: guild.id } });
	// Get mod logging value from config
	const logFlag = serverConfig.get('mod_logging');
	// Get mod channel from config
	const modChannel = serverConfig.get('mod_channel');

	// If mod logging is true log the ban
	if (logFlag) {
		const banEmbed = new Discord.MessageEmbed()
			.setThumbnail(user.displayAvatarURL())
			.setTitle('User Banned')
			.setDescription(`${user.tag} (${user.id})`);
		guild.channels.cache.get(modChannel).send(banEmbed);
	}
});

// UNBAN START

client.on('guildBanRemove', async (guild, user) => {
	// Find server config
	const serverConfig = await sConfig.findOne({ where: { guild_id: guild.id } });
	// Get mod logging value from config
	const logFlag = serverConfig.get('mod_logging');
	// Get mod channel from config
	const modChannel = serverConfig.get('mod_channel');

	// If mod logging is true log the unban
	if (logFlag) {
		const unbanEmbed = new Discord.MessageEmbed()
			.setThumbnail(user.displayAvatarURL())
			.setTitle('User Unbanned')
			.setDescription(`${user.tag} (${user.id})`);
		guild.channels.cache.get(modChannel).send(unbanEmbed);
	}
	// Look for the user in the muted database
	const muteUser = await Muted.findOne({ where: { user_id: user.id } });
	// Do nothing if no user is found
	if (!muteUser) return;

	/*
	If a user is found remove them from the muted database
	This is to prevent people from being rebanned if they got banned for rejoining while muted
	This is no longer an issue though as it no longers bans for rejoining but simply remutes them
	*/

	try {
		const unMuted = await Muted.destroy({ where: { user_id: user.id } });
		// If unable to unmute the user log an error
		if (!unMuted) return console.log(`Failed to unmute ${user.username}`);
	}catch(e) {
		// Console log any other errors
		console.error(e);
	}
});

// NEW MEMBER START

client.on('guildMemberAdd', async (member) => {
	// Find user in muted database
	const muteUser = await Muted.findOne({ where: { user_id: member.id } });
	// Do nothing if no user is found
	if (!muteUser) return;
	// Finds the muted role
	const muteRole = member.guild.roles.cache.find(r => r.name === 'muted');
	// Error if no mute role is found
	if (!muteRole) return console.log(`Error: Could not re-mute user in ${member.guild.name}`);
	// Remutes the user
	member.roles.add(muteRole.id).then(() => {
		member.send(`You have been muted in ${member.guild.name}! Reason: Mute Evasion`);
	});
	modAction(client.user, member, 'Mute', 'Mute Evasion');
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

client.login(token);