module.exports = {
	name: 'repo',
	description: 'Posts the github repository',
	module: 'Utility',
	execute(message) {
		message.channel.send('https://github.com/Klarp/Accela');
	},
};