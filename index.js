/*
	Copyright (C) 2021 Brody Jagoe

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, GNU GPLv3.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.

	Contact: admin@accela.xyz
*/

const fs = require('fs');
const axios = require('axios');
// const osu = require('node-osu');
// const qrate = require('qrate');

const { Intents, Collection, Client, MessageEmbed, Permissions } = require('discord.js');

const Sentry = require('./log');
const { token, owners, AuthToken_BFD, AuthToken_botgg, AuthToken_DBL } = require('./config.json');
// const { token, owners, osu_key, AuthToken_BFD, AuthToken_botgg, AuthToken_DBL } = require('./config.json');
const { Muted, sConfig } = require('./dbObjects');
// const { Users, Muted, sConfig } = require('./dbObjects');

const configs = new Collection();
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
client.commands = new Collection();
const cooldowns = new Collection();
exports.Client = client;

const util = require('./utils');

// let lbDate = Date.now();

module.exports.upDate = () => {
	/**
	if (lbDate) {
		return lbDate;
	}
	*/
};

// const osuApi = new osu.Api(osu_key);

const modules = ['Admin', 'osu!', 'Fun', 'Utility', 'Owner'];

client.on('error', error => {
	client.users.cache.get('186493565445079040').send('An error occured - check the console.');
	Sentry.captureException(error);
	console.log(error);
	console.error();
});

// START COMMAND LOADING

modules.forEach(c => {
	fs.readdir(`./commands/${c}`, (err, files) => {
		if (err) {
			Sentry.captureException(err);
			throw err;
		}

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
	'l-let me out of this bot',
	'now run on human souls',
	'nekopara vol. 1',
	'finding nekopara dlc',
	'creating bot farms',
];

// BOT START

client.once('ready', async () => {
	// Initialize osu! Database
	/**
	const storedUsers = await Users.findAll();
	let startDate;
	storedUsers
		.filter(user => user.verified_id !== null)
		.filter(user => client.users.cache.has(user.user_id));

	// Both name and rank are coming out null in output. Need to fix.
	const worker = async (u) => {
		const osuGame = client.guilds.cache.get('98226572468690944');
		// const logChannel = osuGame.channels.cache.get('776522946872344586');
		// logChannel.send(`Updating ${u.osu_name} with osu! ID: ${u.verified_id}`);

		const osuID = u.get('verified_id');
		const userID = u.get('user_id');
		const mode = u.get('osu_mode');
		let std_rank = null;
		let taiko_rank = null;
		let ctb_rank = null;
		let mania_rank = null;

		// std
		await osuApi.getUser({ u: osuID, m: 0 }).then(osuUser => {
			std_rank = osuUser.pp.rank;
			if (std_rank === '0') std_rank = null;
		});
		// Taiko
		await osuApi.getUser({ u: osuID, m: 1 }).then(osuUser => {
			taiko_rank = osuUser.pp.rank;
			if (taiko_rank === '0') taiko_rank = null;
		});
		// ctb
		await osuApi.getUser({ u: osuID, m: 2 }).then(osuUser => {
			ctb_rank = osuUser.pp.rank;
			if (ctb_rank === '0') ctb_rank = null;
		});
		// Mania
		await osuApi.getUser({ u: osuID, m: 3 }).then(osuUser => {
			mania_rank = osuUser.pp.rank;
			if (mania_rank === '0') mania_rank = null;
		});

		try {
			const upUser = await Users.update({
				std_rank: std_rank,
				taiko_rank: taiko_rank,
				ctb_rank: ctb_rank,
				mania_rank: mania_rank,
			},
			{
				where: { user_id: userID },
			});
			if (upUser > 0) {
				let rank;
				if (mode === 0 && std_rank !== null) rank = std_rank;
				if (mode === 1 && taiko_rank !== null) rank = taiko_rank;
				if (mode === 2 && ctb_rank !== null) rank = ctb_rank;
				if (mode === 3 && mania_rank !== null) rank = mania_rank;
				const osuMember = osuGame.members.cache.get(userID);
				if (osuMember) {
					util.getRankRole(osuMember, rank, mode);
				}
			}
		} catch (err) {
			Sentry.captureException(err);
			console.error(err);
		}
	};

	const q = qrate(worker, 1, 0.5);

	q.drain = () => {
		const osuGame = client.guilds.cache.get('98226572468690944');
		const logChannel = osuGame.channels.cache.get('776522946872344586');

		lbDate = Date.now();
		let finishDate = lbDate - startDate;
		finishDate = finishDate / 60000;
		logChannel.send(`**Finished processing in ${finishDate.toFixed(2)} minutes**`);
	};

	setInterval(async () => {
		const osuGame = client.guilds.cache.get('98226572468690944');
		const logChannel = osuGame.channels.cache.get('776522946872344586');
		const osuUsers = await Users.findAll();
		startDate = Date.now();

		logChannel.send(`**Started processing of ${osuUsers.length} members**`);

		for (let i = 0; i < osuUsers.length; i++) {
			q.push(osuUsers[i]);
		}
	}, 1000 * 60 * 60 * 24);
	*/

	// 60 * 60 * 1000 - One Hour

	// Initialize Server Database
	const serverConfigs = await sConfig.findAll();
	serverConfigs.forEach(s => configs.set(s.guild_id, s));

	// Rotate through activities
	setInterval(() => {
		const index = Math.floor(Math.random() * (activities_list.length - 1) + 1);
		client.user.setActivity(activities_list[index]);
	}, 60 * 1000);

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
				Sentry.captureException(err);
				console.error(err);
				return;
			}
			console.log(`DiscordBotList.com: ${res.status}`);
		})
		.catch(function(error) {
			Sentry.captureException(error);
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
				Sentry.captureException(err);
				console.error(err);
				return;
			}
			console.log(`discord.bots.gg: ${res.status}`);
		})
		.catch(function(error) {
			Sentry.captureException(error);
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
				Sentry.captureException(err);
				console.error(err);
				return;
			}
			console.log(`botsfordiscord.com: ${res.status}`);
		})
		.catch(function(error) {
			Sentry.captureException(error);
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

client.on('messageCreate', async message => {
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
	if (message.channel.type !== 'DM') {
		serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
	}

	let prefix = '>>';
	let modFlag;

	// Get values from the server config
	if (serverConfig) {
		prefix = serverConfig.get('prefix');
		modFlag = serverConfig.get('mod_commands');
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

	// For beta testing
	if (message.channel.guild.id === '98226572468690944') return;

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

	if (command.osuDiscord) {
		if (message.guild.id !== '98226572468690944') return;
	}

	// If command is owner only check if user is owner
	if (command.owner) {
		if (!owners.includes(message.author.id)) return;
	}

	// If command has permissions check user permissions
	if (command.perms) {
		if (!util.checkPerm(message.member, command.perms, message)) return;
	}

	// Stop if a command can't be run inside DMs
	if (command.guildOnly && message.channel.type !== 'GUILD_TEXT') {
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
		cooldowns.set(command.name, new Collection());
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
		Sentry.captureException(error);
		// Creation of error embed
		const errorEmbed = new MessageEmbed()
			.setTitle('An Error Has Occurred')
			.setColor('RED')
			.setDescription(`OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!
			
Please contact @Klarp#0001 if you see this message`);
		// Sends error embed on command failure
		message.channel.send({ embeds: [errorEmbed] });
	}
});

// MESSAGE DELETE START

client.on('messageDelete', async message => {
	if (message.channel.type === 'DM') return;
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
		const delEmbed = new MessageEmbed()
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ dynamic : true }))
			.setColor('RED')
			.setTitle('Message Deleted')
			.setDescription(message)
			.setTimestamp();

		client.channels.cache.get(logChannel).send({ embeds: [delEmbed] });
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
		Sentry.captureException(e);
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

	await util.sleep(1200);

	if (!guild.me.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return;

	const fetchedLogs = await guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_BAN_ADD',
	});

	const banLog = fetchedLogs.entries.first();

	// If mod logging is true log the ban
	if (logFlag || guild.id === '98226572468690944') {
		if (!banLog) {
			const banEmbed = new MessageEmbed()
				.setThumbnail(user.displayAvatarURL({ dynamic : true }))
				.setColor('#EA4D4B')
				.setTitle(`Banned ${user.tag}`)
				.setDescription(`:lock: ${user}`)
				.setTimestamp();

			if (guild.id === '98226572468690944') return guild.channels.cache.get('158484765136125952').send({ embeds: [banEmbed] });

			guild.channels.cache.get(modChannel).send({ embeds: [banEmbed] });
		} else {
			const { executor, target, reason } = banLog;


			if (target.id === user.id && reason) {
				const banEmbed = new MessageEmbed()
					.setThumbnail(user.displayAvatarURL({ dynamic : true }))
					.setColor('#EA4D4B')
					.setTitle(`Banned ${user.tag}`)
					.setDescription(`:lock: ${user}

**Moderator:** ${executor}
**Reason:** ${reason}`)
					.setFooter(`ID: ${user.id}`)
					.setTimestamp();

				if (guild.id === '98226572468690944') return guild.channels.cache.get('158484765136125952').send({ embeds: [banEmbed] });

				guild.channels.cache.get(modChannel).send({ embeds: [banEmbed] });
			} else if(target.id === user.id && !reason) {
				const banEmbed = new MessageEmbed()
					.setThumbnail(user.displayAvatarURL({ dynamic : true }))
					.setColor('#EA4D4B')
					.setTitle(`Banned ${user.tag}`)
					.setDescription(`:lock: ${user}

**Moderator:** ${executor}
**Reason:** No Reason Given`)
					.setFooter(`ID: ${user.id}`)
					.setTimestamp();

				if (guild.id === '98226572468690944') return guild.channels.cache.get('158484765136125952').send({ embeds: [banEmbed] });

				guild.channels.cache.get(modChannel).send({ embeds: [banEmbed] });
			} else {
				const banEmbed = new MessageEmbed()
					.setThumbnail(user.displayAvatarURL({ dynamic : true }))
					.setColor('#EA4D4B')
					.setTitle(`Banned ${user.tag}`)
					.setDescription(`:lock: ${user}`)
					.setFooter(`ID: ${user.id}`)
					.setTimestamp();

				if (guild.id === '98226572468690944') return guild.channels.cache.get('158484765136125952').send({ embeds: [banEmbed] });

				guild.channels.cache.get(modChannel).send({ embeds: [banEmbed] });
			}
		}
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

	await util.sleep(1200);

	if (!guild.me.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return;

	const fetchedLogs = await guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_BAN_REMOVE',
	});

	const unBanLog = fetchedLogs.entries.first();

	// If mod logging is true log the unban
	if (logFlag || guild.id === '98226572468690944') {
		if (!unBanLog) {
			const unbanEmbed = new MessageEmbed()
				.setThumbnail(user.displayAvatarURL({ dynamic : true }))
				.setColor('#4BB580')
				.setTitle(`Unbanned ${user.tag}`)
				.setDescription(`:unlock: ${user}`)
				.setFooter(`ID: ${user.id}`)
				.setTimestamp();

			if (guild.id === '98226572468690944') return guild.channels.cache.get('158484765136125952').send({ embeds: [unbanEmbed] });

			guild.channels.cache.get(modChannel).send({ embeds: [unbanEmbed] });
		} else {
			const { executor, target } = unBanLog;


			if (target.id === user.id) {
				const unbanEmbed = new MessageEmbed()
					.setThumbnail(user.displayAvatarURL({ dynamic : true }))
					.setColor('#4BB580')
					.setTitle(`Unbanned ${user.tag}`)
					.setDescription(`:unlock: ${user}

**Moderator:** ${executor}`)
					.setFooter(`ID: ${user.id}`)
					.setTimestamp();

				if (guild.id === '98226572468690944') return guild.channels.cache.get('158484765136125952').send({ embeds: [unbanEmbed] });

				guild.channels.cache.get(modChannel).send({ embeds: [unbanEmbed] });
			} else {
				const unbanEmbed = new MessageEmbed()
					.setThumbnail(user.displayAvatarURL({ dynamic : true }))
					.setColor('#4BB580')
					.setTitle(`Unbanned ${user.tag}`)
					.setDescription(`:unlock: ${user}`)
					.setFooter(`ID: ${user.id}`)
					.setTimestamp();

				if (guild.id === '98226572468690944') return guild.channels.cache.get('158484765136125952').send({ embeds: [unbanEmbed] });

				guild.channels.cache.get(modChannel).send({ embeds: [unbanEmbed] });
			}
		}
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
		Sentry.captureException(e);
		console.error(e);
	}
});

// NEW MEMBER START

client.on('guildMemberAdd', async member => {
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
	util.modAction(client.user, member, 'Mute', 'Mute Evasion', undefined);
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
	Sentry.captureException(error);
});

// MEMBER LEAVE START

client.on('guildMemberRemove', async (member) => {
	// Find server config
	const serverConfig = await sConfig.findOne({ where: { guild_id: member.guild.id } });
	// Get mod logging value from config
	const logFlag = serverConfig.get('mod_logging');
	// Get mod channel from config
	const modChannel = serverConfig.get('mod_channel');

	const user = member.user;

	if (!member.guild.me.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return;

	const firstFetch = await member.guild.fetchAuditLogs({
		limit: 1,
	});

	const firstLog = firstFetch.entries.first();


	if (firstLog.action === 'MEMBER_BAN_ADD' && firstLog.target.id === member.id) return;

	await util.sleep(1200);

	const fetchedLogs = await member.guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_KICK',
	});

	const kickLog = fetchedLogs.entries.first();


	if (logFlag || member.guild.id === '98226572468690944') {
		if (kickLog) {
			const { executor, target, reason } = kickLog;


			if (target.id === member.id) {
				const kickEmbed = new MessageEmbed()
					.setThumbnail(user.displayAvatarURL({ dynamic : true }))
					.setColor('#F5E44D')
					.setTitle(`Kicked ${user.tag}`)
					.setDescription(`:athletic_shoe: ${user}

**Moderator**: ${executor}
**Reason:** ${reason}`)
					.setFooter(`ID: ${user.id}`)
					.setTimestamp();

				if (member.guild.id === '98226572468690944') return member.guild.channels.cache.get('158484765136125952').send({ embeds: [kickEmbed] });

				member.guild.channels.cache.get(modChannel).send({ embeds: [kickEmbed] });
			} else if (!reason) {
				const kickEmbed = new MessageEmbed()
					.setThumbnail(user.displayAvatarURL({ dynamic : true }))
					.setColor('#F5E44D')
					.setTitle(`Kicked ${user.tag}`)
					.setDescription(`:athletic_shoe: ${user}

**Moderator**: ${executor}`)
					.setFooter(`ID: ${user.id}`)
					.setTimestamp();

				if (member.guild.id === '98226572468690944') return member.guild.channels.cache.get('158484765136125952').send({ embeds: [kickEmbed] });

				member.guild.channels.cache.get(modChannel).send({ embeds: [kickEmbed] });
			}
		}
	}
});

client.login(token);