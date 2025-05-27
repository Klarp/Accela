const { Events } = require('discord.js');
const logger = require('../logger');

module.exports = {
	name: Events.Debug,
	execute(info) {
		logger.debug(info);
	},
};