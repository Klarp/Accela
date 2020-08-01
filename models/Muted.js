module.exports = (seqMute, DataTypes) => {
	return seqMute.define('muted', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
			unique: false,
		},
		guild_id: {
			type: DataTypes.STRING,
			unique: false,
		},
	},	{
		timestamps: false,
	});
};