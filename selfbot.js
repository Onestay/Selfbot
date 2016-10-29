const Discord = require('discord.js');
const bot = new Discord.Client({
	fetch_all_members: true
});
const config = require('./config.json');
const now = require('performance-now');
const moment = require('moment'); // eslint-disable-line
const Danbooru = require('danbooru');
//const authedBooru = new Danbooru({
//	login: 'config.booruLogin',
//	api_key: 'config.booruApiKey'
//});
const fs = require('fs');
const giphy = require('giphy-api')();
const http = require('https');
const path = require('path');

bot.on('ready', () => {
	console.log("Selfbot Ready!");
});

bot.on('message', msg => {
	if (msg.author.id !== bot.user.id) return;

	if (!msg.content.startsWith(config.prefix)) return;

	let command = msg.content.split(" ")[0].slice(config.prefix.length);
	let params = msg.content.split(" ").slice(1);

	if (command === "prune") {
		let messagecount = parseInt(params[0]) ? parseInt(params[0]) : 1;
		msg.channel.fetchMessages({
			limit: 100
		})
			.then(messages => {
				let msg_array = messages.array();
				msg_array = msg_array.filter(m => m.author.id === bot.user.id);
				msg_array.length = messagecount + 1;
				msg_array.map(m => m.delete().catch(console.error));
			});
	} else

		if (command === "purge") {
			let messagecount = parseInt(params[0]);
			msg.channel.fetchMessages({
				limit: messagecount
			})
				.then(messages => {
					messages.map(m => m.delete().catch(console.error));
				}).catch(console.error);
		} else

			if (command === "ping") {
				var startTime = now();
				msg.delete();
				msg.channel.sendMessage("Validating Ping Time")
					.then(message => {
						var endTime = now();
						message.edit(`This Ping took ${(endTime - startTime).toFixed(3)} ms.`).catch(console.error);
					}).catch(console.error);
			} else

				if (command === "playing") {
					var game = msg.content.split(" ").slice(1).join(' ');
					bot.user.setStatus(null, game);
					msg.delete().catch(console.error);
				} else

					if (command === "eval") {
						var code = msg.content.split(" ").slice(1).join(" ");

						try {
							var evaled = eval(code);
							if (typeof evaled !== 'string')
								evaled = require('util').inspect(evaled);
							msg.channel.sendMessage("```xl\n" +
								clean(evaled) +
								"\n```"
							);
						} catch (err) {
							msg.channel.sendMessage("`ERROR` ```xl\n" +
								clean(err) +
								"\n```");
						}
					} else

						if (command === "danbooru") {
							let tag = msg.content.split(" ").slice(1).join(' ');
							Danbooru.search(tag, function (err, data) {
								console.log("Downloaded File");
								var stream = data.random()
									.getLarge()
									.pipe(require('fs').createWriteStream('random.jpg'));
								stream.on('finish', function () { msg.channel.sendFile('random.jpg') });

							});






						} else

							if (command === "gif") {
								var gif = fs.createWriteStream('gif.gif')
								let tag = msg.content.split(" ").slice(1).join(' ');
								giphy.random(tag, function (err, results) {
									if (err) console.log(err);
									console.log(results.data.image_url);
									http.get(results.data.image_url, function (response) {
										response.pipe(gif);
									});
									setTimeout(() => {
										msg.channel.sendFile('gif.gif');
									}, 4000);

								})
							}



})

bot.login(config.token)

function clean(text) {
	if (typeof (text) === "string") {
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	} else {
		return text;
	}
}