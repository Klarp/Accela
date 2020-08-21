const prom_client = require('prom-client');

module.exports = {
	name: 'test',
	description: 'Command Development',
	module: 'Owner',
	owner: true,
	usage: '<user>',
	async execute() {
		const metric = await prom_client.register.metrics();
		console.log(metric);
	},
};