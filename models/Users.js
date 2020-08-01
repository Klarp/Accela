module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
			unique: false,
		},
		user_osu: {
			type: DataTypes.STRING,
			unique: false,
		},
	},	{
		timestamps: false,
	});
};