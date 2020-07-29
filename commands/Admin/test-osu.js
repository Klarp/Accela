// Special thanks to all those helped me with this such as Stedoss, uyitroa and phil.

module.exports = {
	name: 'test-osu',
	aliases: 'tosu',
	description: 'Tests my osu! stuff',
	module: 'osu!',
	perms: 'MANAGE_SERVER',
	async execute(message) {
		console.log(message.guild.channels.cache.find(c => c.GuildChannel === 'CategoryChannel'));
	},
};