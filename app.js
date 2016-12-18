const commando = require('discord.js-commando');
const path = require('path');
const config = require('./config.json');

const client = new commando.Client({
	selfbot: true,
	commandPrefix: 'o<<',
	unkownCommandResponse: false,
	owner: '118425585163698183',
	messageCacheMaxSize: 50,
	messageCacheLifetime: 30,
	messageSweepInterval: 60,
	fetchAllMembers: true,
	disableEveryone: true,
	disabledEvents: [
		'typingStart',
		'userUpdate',
		'voiceStateUpdate'
	]
});

client.on('error', console.error)
		.on('warn', console.warn)
		.on('ready', () => {
			console.log(`Selfbot is ready! Currently in ${client.guilds.size} Guilds and ${client.channels.size} channels.`);
		})
		.on('commandError', (cmd, err) => {
			if (err instanceof commando.FriendlyError) return;
			console.error(`Error in command ${cmd.groupID};${cmd.memberName}. ${err}`);
		});

client.registry
		.registerGroups([
			['media', 'Media'],
			['test', 'Test']
		])
		.registerDefaults()
		.registerCommandsIn(path.join(__dirname, 'commands'));

client.login(config.token);
