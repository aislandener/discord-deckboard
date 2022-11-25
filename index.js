/**
 * @autor Aislan Dener <https://github.com/aislandener>
 */

const RPC = require('discord-rpc');
const ncp = require('copy-paste');
const { Extension, log, INPUT_METHOD, PLATFORMS } = require('deckboard-kit');

class DiscordExtension extends Extension {
	constructor(props) {
		super(props);
		this.dialog = props.dialog;
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
                input: [
                    {
                        label: "Action",
                        ref: "action",
                        type: INPUT_METHOD.INPUT_SELECT,
                        items: [
                            {
                                value: "toggle_microphone",
                                label: "Toggle Microphone",
                            }, {
                                value: "enable_microphone",
                                label: "Enable Microphone",
                            }, {
                                value: "disable_microphone",
                                label: "Disable Microphone",
                            },
                        ]
                    },
                ]
            },
            {
                label: 'Deaf',
                value: "headphone",
                icon: 'headphones',
                color: '#5865F2',
                input: [
                    {
                        label: "Action",
                        ref: "action",
                        type: INPUT_METHOD.INPUT_SELECT,
                        items: [
                            {
                                value: "toggle_headphone",
                                label: "Toggle Deaf",
                            }, {
                                value: "enable_headphone",
                                label: "Disable Deaf",
                            }, {
                                value: "disable_headphone",
                                label: "Enable Deaf",
                            },
                        ]
                    },
                ]
            },
            {
                label: 'Disconnect Voice Channel',
                value: "disconnect-voice",
                icon: 'phone-slash',
                color: '#5865F2',
            },
            {
                label: 'Change input method',
                value: 'change-input',
                icon: 'wave-square',
                color: '#5865F2',
                input: [
                    {
                        label: "Action",
                        ref: "action",
                        type: INPUT_METHOD.INPUT_SELECT,
                        items: [
                            {
                                value: "toggle_input",
                                label: "Toggle Input",
                            }, {
                                value: "push_to_talk",
                                label: "Change to Push to Talk",
                            }, {
                                value: "voice_activity",
                                label: "Change to Voice Activity",
                            },
                        ]
                    }
                ]
            },
            {
            label: 'Connect Voice',
             value: 'connect-voice',
            icon: 'phone',
            color: '#5865F2',
            input: [
             {
            label: "Voice Channel ID",
             ref: "channel_id",
            type: INPUT_METHOD.INPUT_TEXT,
            }
            ]
           }
        ];
        this.configs = {
            discordClientId: {
                type: "text",
                name: "Client ID",
                descriptions: "Client ID in OAuth2 App",
                value: "",
            },
            discordClientSecret: {
                type: "text",
                name: "Client Secret (not distribute)",
                descriptions: "Client Secret in OAuth2 App",
                value: "",
            },
            discordAccessToken: {
                type: "text",
                name: "Access Token (not distribute)",
                descriptions: "Access Token in OAuth2 App",
                value: "",
            },
        };
        this.initExtension();
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
        log.error(ref);
        switch (ref) {
        	case "connectGuild":
                return [{
                    value: "test",
                    label: "teste",
                }];
        		//return this.getMemeboxAction();
        	default:
        		return [];
        }

    }

    async initPlugin() {
        try {

            if (this.configs.discordClientId.value === '')
                return;

			await this._client.login({
				clientId: this.configs.discordClientId.value,
				clientSecret: this.configs.discordClientSecret.value,
				scopes: this._scopes,
				redirectUri: this._redirectUri,
				accessToken: this.configs.discordAccessToken.value
			});

			if(!this.configs.discordAccessToken.value){
				await this.dialog.showMessageBox(null,{
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

    async _microphoneControl({action}) {
        const functions = {
            toggle_microphone: async () => await this._client.setVoiceSettings({mute: !(await this._client.getVoiceSettings()).mute}),
            enable_microphone: async () => await this._client.setVoiceSettings({mute: false}),
            disable_microphone: async () => await this._client.setVoiceSettings({mute: true}),
        }
        const executeFunction = functions[action];
        if(executeFunction){
            return await executeFunction();
        }
    }

    async _headphoneControl({action}) {

        const functions = {
            toggle_headphone: async () => await this._client.setVoiceSettings({deaf: !(await this._client.getVoiceSettings()).deaf}),
            enable_headphone: async () => await this._client.setVoiceSettings({deaf: false}),
            disable_headphone: async () => await this._client.setVoiceSettings({deaf: true}),
        }

        const executeFunction = functions[action];
        if(executeFunction){
            return await executeFunction();
        }
    }

    async _connectVoiceControl(args) {
        return await this._client.selectVoiceChannel(args.channel_id)
    }
    async _connectVoiceChannel(args) {
await this._client.selectVoiceChannel() == await this._client.selectVoiceChannel(args.channel_id) ? await this._client.selectVoiceChannel() : await this._client.selectVoiceChannel(args.channel_id)
    }
    async _changeVoiceInput({action}) {
        const functions = {
            toggle_input: async () => await this._client.setVoiceSettings({
                mode: {
                    type: (await this._client.getVoiceSettings()).mode.type === 'PUSH_TO_TALK' ? 'VOICE_ACTIVITY' : 'PUSH_TO_TALK'
                }
            }),
            push_to_talk: async () => await this._client.setVoiceSettings({mode: {type: 'PUSH_TO_TALK'}}),
            voice_activity: async () => await this._client.setVoiceSettings({mode: {type: 'VOICE_ACTIVITY'}})
        };

        const executeFunction = functions[action];
        if(executeFunction){
            return await executeFunction();
        }
    }

    async execute(action, args) {
        if(!this._client || !this._client.accessToken)
            return await this.initPlugin();
        switch (action) {
            case 'microphone':
                return this._microphoneControl(args);
            case 'headphone':
                return this._headphoneControl(args);
            case 'disconnect-voice':
                return this._connectVoiceControl(args);
            case 'connect-voice':
                return this._connectVoiceChannel(args);
            case 'change-input':
                return this._changeVoiceInput(args);
        }
    };
}

module.exports = sendData => new DiscordExtension(sendData);
