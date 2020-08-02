module.exports = (serverConfig, DataTypes) => {
	return serverConfig.define('config', {
		guild_id: {
			type: DataTypes.STRING,
			primaryKey: true,
			unique: false,
		},
		prefix: {
			type: DataTypes.STRING,
			unique: false,
		},
		mod_channel: {
			type: DataTypes.STRING,
			unique: false,
		},
		msgLog_channel: {
			type: DataTypes.STRING,
			unique: false,
		},
		mod_commands: {
			type: DataTypes.BOOLEAN,
			unique: false,
		},
		mod_logging: {
			type: DataTypes.BOOLEAN,
			unique: false,
		},
		msg_logging: {
			type: DataTypes.BOOLEAN,
			unique: false,
		},
		noprefix_commands: {
			type: DataTypes.BOOLEAN,
			unique: false,
		},
	},	{
		timestamps: false,
	});
};