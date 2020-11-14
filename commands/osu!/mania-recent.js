const osu = require('node-osu');
const discord = require('discord.js');

const { osu_key } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');
const timeSince = require('../../utils/timeSince');
const getRank = require('../../utils/getRank');

module.exports = {
	name: 'mania-recent',
	aliases: ['mr', 'maniar', 'maniarecent', 'mrecent', 'mrs'],
	description: 'Gets the recently completed score on mania!',
	module: 'Osu!',
	perms: '',
	owner: true,
	usage: '<user>',
	async execute(message, args) {
		// Access the api
		const osuApi = new osu.Api(osu_key, {
			notFoundAsError: true,
			completeScores: true,
			parseNumeric: true,
		});

		let prefix = '>>';
		let findUser;
		const menUser = message.mentions.users.first();

		if (message.channel.type !== 'dm') {
			const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
			if (serverConfig) {
				prefix = serverConfig.get('prefix');
			}
		}

		let name;
		let id;
		let verified = `:x: Not Verified [use ${prefix}verify]`;

		// Access database
		if (menUser) {
			findUser = await Users.findOne({ where: { user_id: menUser.id } });
		} else {
			findUser = await Users.findOne({ where: { user_id: message.author.id } });
		}

		if (menUser) {
			name = menUser.username;
			verified = '';
		}

		// Find the user in the database
		if (findUser) {
			if (findUser.get('verified_id')) {
				id = findUser.get('verified_id');
				name = findUser.get('osu_name');
				verified = ':white_check_mark: Verified';
			} else {
				id = findUser.get('osu_id');
			}
		} else {
			name = message.author.username;
			verified = '';
		}

		// Use arguments if applicable
		if (!menUser && args[0]) {
			name = args[0];
			verified = '';
		}

		if (!menUser && args[1]) {
			name = args.join(' ');
			verified = '';
		}

		if (!menUser && !findUser && !args[0]) {
			message.channel.send(`No link found: use ${prefix}link [osu user] to link your osu! account!`);
		}

		const search = name || id;

		// Find user through the api
		osuApi.getUserRecent({ m: 3, u: search }).then(async r => {
			const recent = r[0];
			let acc = recent.accuracy;
			acc = acc.toFixed(4);
			// Calculate acc
			if (acc < 100) {
				acc *= 100;
			}
			acc = parseFloat(acc.toFixed(2));

			const score = recent.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			const rDate = timeSince(recent.date);
			const rank = getRank(recent.rank);

			const hit300 = recent.counts[300];
			const hit100 = recent.counts[100];
			const hit50 = recent.counts[50];
			const hitmiss = recent.counts.miss;

			// Get the short version of mods (HD, HR etc.)
			const osuEmbed = new discord.MessageEmbed()
				.setAuthor(name, `http://a.ppy.sh/${recent.user.id}`)
				.setColor('0xff69b4')
				.setTitle(`${recent.beatmap.artist} - ${recent.beatmap.title} [${recent.beatmap.version}]`)
				.setDescription(`${rank} | ${score} | {${hit300}/${hit100}/${hit50}/${hitmiss}}

**${recent.maxCombo}x** | ${acc}% | PP Coming Soon
				
${verified}`)
				.setURL(`https://osu.ppy.sh/b/${recent.beatmapId}`)
				.setFooter(`Completed ${rDate} • osu!mania`);
			message.channel.send(osuEmbed);
		}).catch(e => {
			if (e.name == 'Error') {
				console.error(e);
				return message.reply(`No recent play was found for ${name}!`);
			}
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};