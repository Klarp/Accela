/* eslint-disable no-case-declarations */
const Discord = require('discord.js');
const { sConfig } = require('../dbObjects');

module.exports = async (mod, member, action, reason, length) => {
	const serverConfig = await sConfig.findOne({ where: { guild_id: member.guild.id } });
	const modLog = serverConfig.get('mod_logging');
	const modChannel = serverConfig.get('mod_channel');
	const modC = member.guild.channels.cache.get(modChannel);

	if (!modLog) return;

	if (modC) {
		if (!reason) reason = 'No Reason Given';

		switch(action) {
		case 'Kick':
			const kickEmbed = new Discord.MessageEmbed()
				.setAuthor(`${mod.tag} (${mod.id})`, mod.displayAvatarURL())
				.setDescription(`**Action**: Kick
					**User**: ${member.user.tag} (${member.user.id})
					**Reason**: ${reason}`)
				.setTimestamp();
			modC.send({ embed: kickEmbed });
			break;
		case 'Ban':
			const banEmbed = new Discord.MessageEmbed()
				.setAuthor(`${mod.tag} (${mod.id})`, mod.displayAvatarURL())
				.setDescription(`**Action**: ${action}
					**User**: ${member.user.tag} (${member.user.id})
					**Reason**: ${reason}`)
				.setTimestamp();
			modC.send({ embed: banEmbed });
			break;
		case 'SoftBan':
			const softBanEmbed = new Discord.MessageEmbed()
				.setAuthor(`${mod.tag} (${mod.id})`, mod.displayAvatarURL())
				.setDescription(`**Action**: ${action}
					**User**: ${member.user.tag} (${member.user.id})
					**Reason**: ${reason}`)
				.setTimestamp();
			modC.send({ embed: softBanEmbed });
			break;
		case 'Mute':
			const muteEmbed = new Discord.MessageEmbed()
				.setAuthor(`${mod.tag} (${mod.id})`, mod.displayAvatarURL())
				.setDescription(`**Action**: ${action}
					**User**: ${member.user.tag} (${member.user.id})
					**Reason**: ${reason}`)
				.setTimestamp();
			modC.send({ embed: muteEmbed });
			break;
		case 'TempMute':
			const tempMuteEmbed = new Discord.MessageEmbed()
				.setAuthor(`${mod.tag} (${mod.id})`, mod.displayAvatarURL())
				.setDescription(`**Action**: ${action}
				**User**: ${member.user.tag} (${member.user.id})
				**Length**: ${length}
				**Reason**: ${reason}`)
				.setTimestamp();
			modC.send({ embed: tempMuteEmbed });
			break;
		case 'Unmute':
			const unmuteEmbed = new Discord.MessageEmbed()
				.setAuthor(`${mod.tag} (${mod.id})`, mod.displayAvatarURL())
				.setDescription(`**Action**: ${action}
					**User**: ${member.user.tag} (${member.user.id})
					**Reason**: ${reason}`)
				.setTimestamp();
			modC.send({ embed: unmuteEmbed });
			break;
		default:
			console.log('[ERROR] Couldn\'t find moderator action.');
		}
	}
};