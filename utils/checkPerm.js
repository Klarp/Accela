module.exports = (user, perm) => {
	if (user.hasPermission(perm)) {
		return true;
	} else {
		return false;
	}
};