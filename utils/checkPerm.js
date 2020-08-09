module.exports = (user, perm, message) => {
	if (message.channel.type === 'dm') return true;
	if (user.hasPermission(perm)) {
		return true;
	} else {
		return false;
	}
};