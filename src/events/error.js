const { Events } = require('discord.js');
const logger = require('../logger');

module.exports = {
	name: Events.Error,
	execute(error) {
		logger.error(error);
	},
};