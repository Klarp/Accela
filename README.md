# Accela

Accela is a new osu! and moderation bot
 
 [![Bots for Discord](https://botsfordiscord.com/api/bot/687856844848234502/widget)](https://botsfordiscord.com/bots/687856844848234502)

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
- Phil
- Peeman69
- Stedoss

## License
[MIT](https://choosealicense.com/licenses/mit/)
