const Discord = require('discord.js');
const bot = new Discord.Client({ fetch_all_members: true });
const config = require('./config.json');
const now = require('performance-now');
const moment = require('moment'); // eslint-disable-line
const danbooru = require('danbooru');
const http = require('http');
const fs = require('fs');
const giphy = require('giphy-api')();


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
		msg.channel.fetchMessages({ limit: 100 })
			.then(messages => {
				let msg_array = messages.array();
				msg_array = msg_array.filter(m => m.author.id === bot.user.id);
				msg_array.length = messagecount + 1;
				msg_array.map(m => m.delete().catch(console.error));
			});
	} else

		if (command === "purge") {
			let messagecount = parseInt(params[0]);
			msg.channel.fetchMessages({ limit: messagecount })
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
						}
						catch (err) {
							msg.channel.sendMessage("`ERROR` ```xl\n" +
								clean(err) +
								"\n```");
						}
					} else

						if (command === "danbooru") {
							let tag = msg.content.split(" ").slice(1).join(' ');
							let randomPost = Math.random() * (9 - 1) + 1;
							var image = fs.createWriteStream('image.jpg');
							danbooru.get('posts', { limit: 10, tags: tag }, function (err, results) {
								if (err) console.log(err);
								console.log(randomPost.toFixed(0));
								for (var i in results) { //eslint-disable-line
									var largeFile = results[randomPost.toFixed(0)].large_file_url;
								}
								//msg.channel.sendMessage("http://danbooru.donmai.us/" + largeFile);
								http.get("http://danbooru.donmai.us/" + largeFile, function (response) {
									response.pipe(image);
								});
								setTimeout(() => {
									msg.channel.sendFile('image.jpg');
								}, 2000);


							})
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
	}
	else {
		return text;
	}
}