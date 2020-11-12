# Accela

Accela is a new osu! and moderation bot

We are currently in beta but have functional and neat osu! related commands. 
Accela strives to become a simple and elegant looking osu! bot which only shows the user the most important information.

## Commands

### Admin
- ban: Ban a user from the server.
- config: Set's configuration for the server
- kick: Kick a user from the server.
- mute: Mute a member
- prefix: Set's prefix for the server
- soft-ban: Kick a member and remove messages
- temp-mute: Temporally mutes users.
- unmute: Unmute a member

### osu!
- calc: Calculates pp
- compare: Compares with last score sent.
- link: Links osu! account for use with osu commands.
- mania: Gets the requested osu! user information for mania.
- map: Gets the requested beatmap information.
- osu: Gets the requested osu! user information.
- recent: Gets the recently completed score on osu!
- top: Gets the top score of the user
- unlink: Unlinks osu! account

### Fun
- play: How to get better at osu!

### Utility
- args-info: Information about the arguments provided.
- avatar: Gets the avatar of the user
- bot-info: Get information about the bot
- help: List all of my commands or info about a specific command.
- ping: Ping!
- repo: Posts the github repository
- server-info: Get information about the server
- user-info: Get information about yourself or a user

## Installation

Use the package manager [node.js](https://nodejs.org/en/) to install Accela.

```bash
npm install
```

## Config File

To use Accela create a config.json inside the file directory with the following code

```json
{
	"prefix": "<prefix>",
	"token": "<discord_token>",
	"owners": ["owner_id", "co-owner_id"],
	
	"osu_key": "<osu_api_key>",
	"osu_mods": [ 
		"None",
		"NoFail", 
		"Easy", 
		"Hidden", 
		"HardRock", 
		"SuddenDeath", 
		"DoubleTime", 
		"HalfTime", 
		"Nightcore", 
		"Flashlight", 
		"Autoplay", 
		"SpunOut"
	],
	"mod_sh": {
		"None": "NoMod",
		"NoFail": "NF",
		"Easy": "EZ",
		"Hidden": "HD",
		"HardRock": "HR",
		"SuddenDeath": "SD",
		"DoubleTime": "DT",
		"HalfTime": "HT",
		"Nightcore": "NC",
		"Flashlight": "FL",
		"Autoplay": "Auto",
		"SpunOut": "SO"
	}
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Special Thanks
- Phil#9284
- Peeman69#3117
- Stedoss#1309

## License
[MIT](https://choosealicense.com/licenses/mit/)

 [![Bots for Discord](https://botsfordiscord.com/api/bot/687856844848234502/widget)](https://botsfordiscord.com/bots/687856844848234502)
