module.exports = {
	name: 'highlow',
	aliases: 'hilo',
	description: 'Testing for gamble commands',
	module: 'Owner',
	owner: true,
	execute(message) {
		const filter = m => m.author === message.author;
		const number = Math.round((Math.random() * 14 + 2));
		const userNumber = Math.round((Math.random() * 14 + 2));
		message.channel.send(`The number is: ${number} (High or Low)`);
		message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
			.then(answer => {
				if (answer.content.toLowerCase() === 'high') {
					if (userNumber >= number) {
						console.log('You win!');
					} else {
						console.log('You lose!');
					}
				} else if (answer.content.toLowerCase() === 'low') {
					if (userNumber <= number) {
						console.log('You win!');
					} else {
						console.log('You lose!');
					}
				} else {
					message.reply('Not a valid option!');
				}
				console.log('oink');
			})
			.catch(collected => {
				if (collected.size == 0) {
					return message.reply('you did not answer in time!');
				} else {
					console.log(collected.size);
				}
			});
	},
};