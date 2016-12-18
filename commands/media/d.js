const { Command } = require('discord.js-commando');
const Danbooru = require('danbooru');
const config = require('../../config.json');
const moment = require('moment');
const authedBooru = new Danbooru({ login: config.danLogin, api_key: config.danAPIKey }); //eslint-disable-line

module.exports = class DCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'd',
			group: 'media',
			memberName: 'd',
			description: 'A command to lookup danbooru',
			guildOnly: false,

			argsType: 'multiple',
			argsCount: 6
		});
	}

	async run(msg, args) {
		let safe = args[0] === 'safe';
		let query;
		if (args[0] === 'safe') {
			query = args.slice(1).join(' ');
		} else {
			query = args.join(' ');
		}
		msg.edit('Getting image...');
		this.getImage(query, safe)
		.then(img => {
			msg.edit('Uploading image...');
			msg.channel.sendFile(img.url)
			.then(msg.delete());
		})
		.catch(e => msg.channel.sendMessage(e));
	}

	getImage(query, safe) {
		return new Promise((resolve, reject) => {
			let image;
			if (safe) {
				authedBooru.search(`rating:safe ${query}`, (err, results) => {
					if (results.length === 0) return reject(`Couldn't find any images`);
					if (results.success === 'false') return reject(data.message);
					if (err) reject(err);
					let data = results.random();
					image = {
						url: `https://danbooru.donmai.us${data.file_url}`,
						fileExtension: data.file_ext,
						artist: data.tag_string_artist,
						character: data.tag_string_character,
						copyright: data.tag_string_copyright,
						rating: this.resolveRating(data.rating),
						createdAt: moment(data.created_at).format('DD MM YY')
					};
					resolve(image);
				});
			} else if (!safe) {
				authedBooru.search(`${query}`, (err, results) => {
					if (results.length === 0) return reject(`Couldn't find any images for the tag ${query}`);
					if (results.success === 'false') return reject(results.message);
					if (err) reject(err);
					let data = results.random();
					image = {
						url: `https://danbooru.donmai.us${data.file_url}`,
						fileExtension: data.file_ext,
						artist: data.tag_string_artist,
						character: data.tag_string_character,
						copyright: data.tag_string_copyright,
						rating: this.resolveRating(data.rating),
						createdAt: moment(data.created_at).format('DD.MM.YY'),
						searchQuery: query
					};
					resolve(image);
				});
			} else {
				reject(`Something went wrong with the safe search... query: ${query} safe: ${safe}`);
			}
		});
	}

	resolveRating(rating) {
		if (rating === 's') {
			return 'Safe';
		} else if (rating === 'e') {
			return 'Explicit';
		} else if (rating === 'q') {
			return 'Questionable';
		}
	}
};

process.on('unhandledRejection', err => {
	console.error('Uncaught Promise Error: \n' + err.stack); //eslint-disable-line
});
