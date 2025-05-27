const { Events } = require('discord.js');
const logger = require('../logger');

module.exports = {
	name: Events.Warn,
	execute(info) {
		logger.warn(info);
	},
};