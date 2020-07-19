module.exports = {
	name: 'reload',
	description: 'Reloads a command',
	perms: 'ADMINISTRATOR',
	module: 'Admin',
	usage: '[command name]',
	args: true,
	execute(message, args) {
		if (!message.author.id === '186493565445079040') return;
		const commandName = args[0].toLowerCase();
		const command = message.client.commands.get(commandName)
			|| message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);

		delete require.cache[require.resolve(`../${command.module}/${command.name}.js`)];

		try {
			const newCommand = require(`../${command.module}/${command.name}.js`);
			message.client.commands.set(newCommand.name, newCommand);
			message.channel.send(`Command \`${command.name}\` was reloaded!`);
		} catch (error) {
			console.log(error);
			message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
		}
	},
};