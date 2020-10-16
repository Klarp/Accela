const { Client } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'fake',
	description: 'Creates a fake halloween popup',
	module: 'Owner',
	owner: true,
	execute(message, args) {
        const osu_server = Client.guilds.cache.get('98226572468690944');
        const offtopic = osu_server.channels.cache.get('158481913055674368');
        const general = osu_server.channels.cache.get('98226572468690944');
        
        const man_shark = 'https://cdn.discordapp.com/halloween-bot/Man-shark.png';
        const centaur = 'https://cdn.discordapp.com/halloween-bot/Centaur.png';
        
        if (args === '1') {
            const centaurEmbed = new MessageEmbed()
                .setTitle('A trick-or-treater has stopped by!')
                .setColor('#7289DA')
                .setDescription('Open the door to greet them with h!treat')
                .setImage(centaur);
        
            general.send(centaurEmbed);
        } else {
            const manSharkEmbed = new MessageEmbed()
                .setTitle('A trick-or-treater has stopped by!')
                .setColor('#7289DA')
                .setDescription('Open the door to greet them with h!treat')
                .setImage(man_shark);
        
            general.send(manSharkEmbed);
        }
	},
};