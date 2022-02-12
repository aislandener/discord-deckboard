/**
 * @autor Aislan Dener <https://github.com/aislandener>
 */

const RPC = require('discord-rpc');
const ncp = require('copy-paste');
const { dialog } = require('electron');
const { Extension, log, INPUT_METHOD, PLATFORMS } = require('deckboard-kit');

class DiscordExtension extends Extension {
	constructor(props) {
		super(props);
		this.setValue = props.setValue;
		this._redirectUri = 'https://discord.com';
		this._scopes = [
			'identify',
			'rpc',
			'rpc.notifications.read',
			'rpc.voice.read',
			'rpc.voice.write',
			'rpc.activities.write',
		];
		this._client = new RPC.Client({ transport: 'ipc' });

		this.name = 'Discord Deckboard';
		this.platforms = [PLATFORMS.WINDOWS, PLATFORMS.MAC, PLATFORMS.LINUX];
		this.inputs = [
			{
				label: 'Microphone',
				value: "microphone",
				icon: 'microphone',
				color: '#5865F2',
				input:[
					{
						label: "Action",
						ref: "action",
						type: INPUT_METHOD.INPUT_SELECT,
						items:[
							{
								value: "toggle_microphone",
								label: "Toggle Microphone",
							},{
								value: "enable_microphone",
								label: "Enable Microphone",
							},{
								value: "disable_microphone",
								label: "Disable Microphone",
							},
						]
					},
				]
			},
		];
		this.configs = {
			discordClientId:{
				type: "text",
				name: "Client ID",
				descriptions: "Client ID in OAuth2 App",
				value: "",
			},
			discordClientSecret:{
				type: "text",
				name: "Client Secret (not distribute)",
				descriptions: "Client Secret in OAuth2 App",
				value: "",
			},
			discordAccessToken:{
				type: "text",
				name: "Access Token (not distribute)",
				descriptions: "Access Token in OAuth2 App",
				value: "",
			},
		};
		this.initExtension()
	}

	// Executes when the extensions loaded every time the app start.
	initExtension() {
		this.initPlugin();
	}

	get selections() {
		return [
			{
				header: this.name,
			}, ...this.inputs,
		];
	}



	getAutocompleteOptions(ref) {
		// switch (ref) {
		// 	case "mediaID":
		// 		return this.getMemeboxAction();
		// 	default:
		// 		return [];
		// }

	}

	async initPlugin() {
		try {

			if(this.configs.discordClientId.value === '')
				return;

			await this._client.login({
				clientId: this.configs.discordClientId.value,
				clientSecret: this.configs.discordClientSecret.value,
				scopes: this._scopes,
				redirectUri: this._redirectUri,
				accessToken: this.configs.discordAccessToken.value
			});
			if(this.configs.discordAccessToken.value === ''){
				await dialog.showMessageBox(null,{
					type: 'info',
					buttons: ['Copy','OK'],
					defaultId: 0,
					title: "Token Discord",
					message: `Copy access token and paste in config in Config(Cog) > Extensions > Config > 'Access Token (not distribute)'\nAccess Token: ${this._client.accessToken}`
				},_ => ncp.copy(this._client.accessToken));
			}
		}catch (e){
			log.error(e);
		}
	}

	execute(action, arg) {
		switch(action){
			case 'microphone':
				switch (arg.action){
					case 'toggle_microphone':
						this._client.getVoiceSettings().then(settings => {
							this._client.setVoiceSettings({mute: !settings.mute});
						});
						break;
					case 'enable_microphone':
						this._client.setVoiceSettings({
							mute: false
						});
						break;
					case 'disable_microphone':
						this._client.setVoiceSettings({
							mute: true
						});
						break;
				}
				break;
		}
	};
}

module.exports = sendData => new DiscordExtension(sendData);
