// const Discord = require('discord.js');
const { Users } = require('../../dbObjects');

module.exports = {
	name: 'leaderboard',
	aliases: '',
	description: 'Gets a verified leaderboard of all users in the server',
	module: 'Osu!',
	guildOnly: true,
	usage: '<user>',
	owner: true,
	async execute(message) {

		const users = await Users.findAll();
		const userList = [];

		function User(name, rank) {
			this.name = name;
			this.rank = rank;
		}

		await users.forEach(u => {
			if (u.verified_id === null) return;
			if (!message.guild.members.cache.get(u.user_id)) return;
			const x = new User(u.osu_name, u.verified_id);
			userList.push(x);
		});

		userList.sort((a, b) => a.rank - b.rank);

		userList.forEach(user => {
			console.log(user);
		});
	},
};