/**
 * @autor Aislan Dener <https://github.com/aislandener>
 */

const { Extension, log, INPUT_METHOD, PLATFORMS } = require('deckboard-kit');

class DiscordExtension extends Extension {
	constructor() {
		super();
		this.name = 'Discord Deckboard';
		this.platforms = [PLATFORMS.WINDOWS, PLATFORMS.MAC];
		this.inputs = [
			{
				label: 'Toggle AFK',
				value: 'toggle-afk',
				icon: 'user-slash',
				color: '#2a3b68'
			},
			{
				label: 'Toggle Mic',
				value: 'toggle-microphone',
				icon: 'microphone',
				color: '#2a3b68'
			},
			{
				label: 'Toggle Sound',
				value: 'toggle-sound',
				icon: 'headphones',
				color: '#2a3b68'
			},
		];
		this.configs = null;
	}

	execute(action) {
		log(action);
	};
}

module.exports = new DiscordExtension();
