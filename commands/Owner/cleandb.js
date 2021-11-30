// Copyright (C) 2021 Brody Jagoe

const { Users } = require('../../dbObjects');

module.exports = {
	name: 'cleandb',
	aliases: ['clean', 'dbclean'],
	description: 'Cleans database of null users',
	module: 'Owner',
	owner: true,
	async execute() {
		const users = await Users.findAll();
		let user;

		console.log(`Checking ${users.length} users in the DB`);

		for (user in users) {
			if (user.osu_name === null) {
				Users.destroy({ where: { user_id: user.user_id } });
				console.log(`Removed ${user.osu_name} from the DB`);
			}
		}
	},
};