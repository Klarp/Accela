module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
			unique: false,
		},
		osu_name: {
			type: DataTypes.STRING,
			unique: false,
		},
		osu_id: {
			type: DataTypes.STRING,
			unique: false,
		},
		verified_id: {
			type: DataTypes.STRING,
			unique: false,
		},
		osu_mode: {
			type: DataTypes.INTEGER,
			unique: false,
			defaultValue: 0,
		},
		std_rank: {
			type: DataTypes.STRING,
			unique: false,
		},
		taiko_rank: {
			type: DataTypes.STRING,
			unique: false,
		},
		mania_rank: {
			type: DataTypes.STRING,
			unique: false,
		},
		ctb_rank: {
			type: DataTypes.STRING,
			unique: false,
		}
	},	{
		timestamps: false,
	});
};