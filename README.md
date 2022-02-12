# discord-deckboard
A plugin to execute Discord actions via RPC from Deckboard

## Setup

### Requirements

* Install [Deckboard](https://deckboard.app/) App
* Install [Discord](https://discord.app/) App (not Browser)

### Installing

#### From Deckboard

Search Discord Deckboard in Configs(Cog) > Extensions > Downloads.

#### Download prebuilt version
* Download the released [discord-deckboard.asar](https://github.com/aislandener/discord-deckboard/releases) file
* Save it to your `{HOME_DIR}/deckboard/extensions` folder
   * e.g. `C:\Users\demo\deckboard\extensions`

#### Compile from source

* Clone the repository to your pc
* cd into your cloned repository folder
* Run `npm install` command
* Run `npm run install` command
  * This will build the `.asar` file and place it in your extensions folder

##### Requirements
* [Node.js® & npm](https://nodejs.org/en/)
  
## Configure

### Discord

* Open [Discord Developers ](https://discord.com/developers) in Browser;
* Login in your account Discord;
* In page Applications click in button `New Application`;
* Provide a name for your application, e.g. `Deckboard`;
* Go to the OAuth2 page and click `Add Redirect` and add `https://discord.com`
  * Continue on this page because we will need some information on this one yet.

### Deckboard

* Click in Config(Cog) >  Extensions > Configs;
* Copy Client ID in Discord Developer Portal and paste in Deckboard in field `Client ID` and click `SAVE` button;
* Copy Client Secret in Discord Developer Portal and paste in Deckboard in field `Client Secret (not distribute)`and click `SAVE` button;
* Restart Deckboard with Discord open;
* When the app opens, Discord will ask for authorization to use the API, authorize in Discord to continue;
* Once you authorize, the access token will appear in a pop-up, when you click on the `COPY` button, the access token will copy to the clipboard;
* Go to Config(Cog) > Extensions > Config and paste in `Access Token (not distribute)` and click `SAVE` button;

## Contribute

You can make pull requests that I will review and publish as soon as possible.

Donations can be made through the BuyMeACoffee platform

[![Buy me a coffee ](https://raw.githubusercontent.com/appcraftstudio/buymeacoffee/master/Images/snapshot-bmc-button.png)](https://www.buymeacoffee.com/aislandener)