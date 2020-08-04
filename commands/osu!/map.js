const osu = require('node-osu');
const oj = require('ojsama');
const Discord = require('discord.js');
const curl = require('curl');

const { osu_key } = require('../../config.json');
const getDiff = require('../../utils/getDiff.js');
const idGrab = require('../../index.js');

module.exports = {
	name: 'map',
	aliases: ['beatmap', 'bmap'],
	description: 'Gets the requested beatmap information.',
	module: 'osu!',
	usage: '<beatmap> +<mods>',
	async execute(message, args) {
		// Access the api
		const osuApi = new osu.Api(osu_key);
		let bMap;
		let mods = '';

		if (args[0] && !args[0].startsWith('+')) {
			bMap = args[0].split('/').pop();
		}

		if (args[1] && args[1].startsWith('+')) {
			bMap = args[0].split('/').pop();
			mods = args[1].slice(1);
		}

		if (!args[0] || args[0].startsWith('+')) {
			if (!idGrab) return message.reply('No map found');
			if (!idGrab.mapID) return message.reply('No map found');
			bMap = idGrab.mapID.toString().split('/').pop();
			if (args[0]) {
				mods = args[0].slice(1);
			}
		}

		// Find user through the api
		osuApi.getBeatmaps({ b: bMap }).then(beatmap => {
			const map = beatmap[0];
			osuApi.getUser({ u: map.creator }).then(u => {
				curl.get(`https://osu.ppy.sh/osu/${map.id}`, function(err, response, body) {
					mods = oj.modbits.from_string(mods);

					const parser = new oj.parser().feed(body);
					const pMap = parser.map;
					const maxPP = oj.ppv2({ map: pMap, mods: mods }).toString();
					const ppFix = maxPP.split(' ');
					const stars = new oj.diff().calc({ map: pMap });
					const star = stars.toString().split(' ');

					const diff = getDiff(star[0]);

					const lenMinutes = Math.floor(map.length.total / 60);
					const lenSeconds = map.length.total - lenMinutes * 60;
					const drainMinutes = Math.floor(map.length.drain / 60);
					const drainSeconds = map.length.drain - drainMinutes * 60;

					const adate = map.approvedDate;
					const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });
					const [{ value: amonth },, { value: aday },, { value: ayear }] = dateTimeFormat.formatToParts(adate);
					const udate = map.lastUpdate;
					const [{ value: umonth },, { value: uday },, { value: uyear }] = dateTimeFormat.formatToParts(udate);

					console.log(mods);

					// Create the embed
					const osuEmbed = new Discord.MessageEmbed()
						.setColor('0xff69b4')
						.setAuthor(map.creator, `http://a.ppy.sh/${u.id}`)
						.setTitle(`${map.artist} - ${map.title} (${map.version})`)
						.setThumbnail(`https://b.ppy.sh/thumb/${map.beatmapSetId}l.jpg`)
						.setURL(`https://osu.ppy.sh/b/${map.id}`)
						.setDescription(`${diff} ${star[0]}★ | **Length**: ${lenMinutes}:${lenSeconds} (${drainMinutes}:${drainSeconds}) | **BPM:** ${map.bpm}
**Combo:** ${map.maxCombo}x | **Max PP:** ${ppFix[0]}pp | **Mods:** ${oj.modbits.string(mods) || 'NoMod'}

Circles: ${map.objects.normal} | Sliders: ${map.objects.slider} | Spinners: ${map.objects.spinner}`)
						.setFooter(`${map.approvalStatus} on ${aday}-${amonth}-${ayear} | Last Updated: ${uday}-${umonth}-${uyear}`);

					message.channel.send({ embed: osuEmbed });
				});
			}).catch(e => {
				console.error(e);
			});
		}).catch(e => {
			console.error(e);
			return message.reply('No map was found!');
		});
	},
};