/**
 * @autor Aislan Dener <https://github.com/aislandener>
 */

const util = require('util')
const RPC = require("discord-rpc");
const { Extension, log, INPUT_METHOD, PLATFORMS } = require("deckboard-kit");

class DiscordExtension extends Extension {
  constructor(props) {
    super(props);
    log.error(util.inspect(props, false, null, false /* enable colors */))
    this.dialog = props.dialog;
    this.setValue = props.setValue;
    this.setLabel = props.setLabel;
    this.data = props.data;
    this._redirectUri = "https://discord.com";
    this._scopes = [
      "identify",
      "rpc",
      "rpc.notifications.read",
      "rpc.voice.read",
      "rpc.voice.write",
      "rpc.activities.write",
    ];
    this._client = new RPC.Client({ transport: "ipc" });

    this.name = "Discord Deckboard";
    this.platforms = [PLATFORMS.WINDOWS, PLATFORMS.MAC, PLATFORMS.LINUX];
    this.inputs = [
      {
        label: 'Toggle Microphone',
        value: "toggle-microphone",
        icon: "microphone",
        mode: 'custom-value',
        color: '#5865F2'
      },
      {
        label: 'Toggle Headphone',
        value: "toggle-headphone",
        icon: "headphones",
        mode: 'custom-value',
        color: '#5865F2'
      },
      {
        label: "Microphone",
        value: "microphone",
        icon: "microphone",
        color: "#5865F2",
        input: [
          {
            label: "Action",
            ref: "action",
            type: INPUT_METHOD.INPUT_SELECT,
            items: [
              {
                value: "enable_microphone",
                label: "Enable Microphone",
              },
              {
                value: "disable_microphone",
                label: "Disable Microphone",
              },
            ],
          },
        ],
      },
      {
        label: "Deaf",
        value: "headphone",
        icon: "headphones",
        color: "#5865F2",
        input: [
          {
            label: "Action",
            ref: "action",
            type: INPUT_METHOD.INPUT_SELECT,
            items: [
              {
                value: "enable_headphone",
                label: "Disable Deaf",
              },
              {
                value: "disable_headphone",
                label: "Enable Deaf",
              },
            ],
          },
        ],
      },
      {
        label: "Disconnect Voice Channel",
        value: "disconnect-voice",
        icon: "phone-slash",
        color: "#5865F2",
      },
      {
        label: "Change input method",
        value: "change-input",
        icon: "wave-square",
        color: "#5865F2",
        input: [
          {
            label: "Action",
            ref: "action",
            type: INPUT_METHOD.INPUT_SELECT,
            items: [
              {
                value: "toggle_input",
                label: "Toggle Input",
              },
              {
                value: "push_to_talk",
                label: "Change to Push to Talk",
              },
              {
                value: "voice_activity",
                label: "Change to Voice Activity",
              },
            ],
          },
        ],
      },
      {
        label: "Connect Voice",
        value: "connect-voice",
        icon: "phone",
        color: "#5865F2",
        input: [
          {
            label: "Select voice channel",
            ref: "channel_id",
            type: "input:autocomplete",
          },
        ],
      },
    ];
    this.configs = {
      discordClientId: {
        descriptions: "Client ID in OAuth2 App",
        name: "Client ID",
        type: "text",
        value: "",
      },
      discordClientSecret: {
        type: "text",
        name: "Client Secret (not distribute)",
        descriptions: "Client Secret in OAuth2 App",
        value: "",
      },
    };
    this.initExtension();
  }

  // Executes when the extensions loaded every time the app start.
  initExtension() {
    this.initPlugin().catch((e) => log.error(e));
  }

  get selections() {
    return [
      {
        header: this.name,
      },
      ...this.inputs,
    ];
  }

  _labelMuteDeaf(value) {
    return value ? 'OFF' : 'ON';
  getAutocompleteOptions(ref) {
    switch (ref) {
      case "connectGuild":
        return this._getGuilds();
      case "channel_id":
        return this._getVoiceChannels();
      default:
        return [];
    }
  }

  async initPlugin() {
    try {
      if (this.configs.discordClientId.value === "") return;

      await this._client.login({
        clientId: this.configs.discordClientId.value,
        clientSecret: this.configs.discordClientSecret.value,
        scopes: this._scopes,
        redirectUri: this._redirectUri,
      });

      this.setValue({ 'toggle-microphone': this._labelMuteDeaf((await this._client.getVoiceSettings()).mute) });
      this.setValue({ 'toggle-headphone': this._labelMuteDeaf((await this._client.getVoiceSettings()).deaf) });
    } catch (e) {
      log.error(e);
    }
  }

  async _microphoneControlToggle({ action }) {
    var newMuteStatus = !(await this._client.getVoiceSettings()).mute;
    this.setValue({ 'toggle-microphone': this._labelMuteDeaf(newMuteStatus) });
    await this._client.setVoiceSettings({
      mute: newMuteStatus,
    });
  }

  async _headphoneControlToggle({ action }) {
    var newDeafStatus = !(await this._client.getVoiceSettings()).deaf;
    this.setValue({ 'toggle-headphone': this._labelMuteDeaf(newDeafStatus) });
    await this._client.setVoiceSettings({
      deaf: newDeafStatus,
    });
  }


  async _getGuilds() {
    return await this._client
      .getGuilds()
      .then(({ guilds }) =>
        guilds.map(({ id, name }) => ({ value: id, label: name }))
      );
  }

  async _getVoiceChannels() {
    const guilds = await this._client
      .getGuilds()
      .then(({ guilds }) =>
        guilds.map(({ id, name }) => ({ value: id, label: name }))
      );

    const channels = [];
    for (let guild of guilds) {
      let guildChannels = await this._client
        .getChannels(guild.value)
        .then((channels) => channels.filter(({ type }) => type === 2));

      guildChannels
        .map((channel) => ({
          value: channel.id,
          label: guild.label + " - " + channel.name,
        }))
        .forEach((guild) => {
          channels.push(guild);
        });
    }

    //log.error(channels);

    return channels;
  }

  async _microphoneControl({ action }) {
    const functions = {
      enable_microphone: async () =>
        await this._client.setVoiceSettings({ mute: false }),
      disable_microphone: async () =>
        await this._client.setVoiceSettings({ mute: true }),
    };
    const executeFunction = functions[action];
    if (executeFunction) {
      return await executeFunction();
    }
  }

  async _headphoneControl({ action }) {
    const functions = {
      enable_headphone: async () =>
        await this._client.setVoiceSettings({ deaf: false }),
      disable_headphone: async () =>
        await this._client.setVoiceSettings({ deaf: true }),
    };

    const executeFunction = functions[action];
    if (executeFunction) {
      return await executeFunction();
    }
  }

  async _connectVoiceControl(args) {
    return await this._client.selectVoiceChannel(args.channel_id);
  }
  async _connectVoiceChannel(args) {
    log.error(args);
    (await this._client.selectVoiceChannel()) ==
      (await this._client.selectVoiceChannel(args.channel_id))
      ? await this._client.selectVoiceChannel()
      : await this._client.selectVoiceChannel(args.channel_id);
  }
  async _changeVoiceInput({ action }) {
    const functions = {
      toggle_input: async () =>
        await this._client.setVoiceSettings({
          mode: {
            type:
              (await this._client.getVoiceSettings()).mode.type ===
                "PUSH_TO_TALK"
                ? "VOICE_ACTIVITY"
                : "PUSH_TO_TALK",
          },
        }),
      push_to_talk: async () =>
        await this._client.setVoiceSettings({ mode: { type: "PUSH_TO_TALK" } }),
      voice_activity: async () =>
        await this._client.setVoiceSettings({
          mode: { type: "VOICE_ACTIVITY" },
        }),
    };

    const executeFunction = functions[action];
    if (executeFunction) {
      return await executeFunction();
    }
  }

  async execute(action, args) {
    if (!this._client || !this._client.accessToken)
      return await this.initPlugin();
    switch (action) {
      case "toggle-microphone":
        return this._microphoneControlToggle(args);
      case "toggle-headphone":
        return this._headphoneControlToggle(args);
      case "microphone":
        return this._microphoneControl(args);
      case "headphone":
        return this._headphoneControl(args);
      case "disconnect-voice":
        return this._connectVoiceControl(args);
      case "connect-voice":
        return this._connectVoiceChannel(args);
      case "change-input":
        return this._changeVoiceInput(args);
    }
  }
}

module.exports = (sendData) => new DiscordExtension(sendData);
