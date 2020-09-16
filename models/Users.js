module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			unique: false,
		},
		osu_mode: {
			type: DataTypes.INTEGER,
			unique: false,
			defaultValue: 0,
		},
		osu_name: {
			type: DataTypes.STRING,
			unique: false,
		},
		osu_id: {
			type: DataTypes.INTEGER,
			unique: false,
		},
		verified_id: {
			type: DataTypes.INTEGER,
			unique: true,
		},
	},	{
		timestamps: false,
	});
};