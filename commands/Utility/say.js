module.exports = {
	name: 'say',
	module: 'Utility',
	usage: 'message',
	// userPermissions: 'MANAGE_CHANNELS',
	execute(message, args) {
		message.channel.send(args.join(' '));
	},
};