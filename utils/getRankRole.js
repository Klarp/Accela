module.exports = async (member, rank, mode) => {
	let role;

	if (mode === 0) {
		if (rank < 100) {
			// 1 - 99
			role = '754085973003993119';
		} else if (rank < 500) {
			// 100 - 499
			role = '754086188025118770';
		} else if (rank < 10000) {
			// 500 - 9999
			role = '754086290785304627';
		} else if (rank < 50000) {
			// 10000 - 49999
			role = '754086299681685696';
		} else if (rank < 100000) {
			// 50000 - 99999
			role = '754086107456471062';
		} else {
			// 100000+
			role = '754089529287245855';
		}
	}

	// Taiko
	if (mode === 1) {
		if (rank < 100) {
			// 1 - 99
			role = '754087013904547930';
		} else if (rank < 500) {
			// 100 - 499
			role = '754087748209475595';
		} else if (rank < 10000) {
			// 500 - 9999
			role = '754087814106448012';
		} else if (rank < 50000) {
			// 10000 - 49999
			role = '754087911066173460';
		} else if (rank < 100000) {
			// 50000 - 99999
			role = '754087679003721790';
		} else {
			// 100000+
			role = '754089750717136906';
		}
	}

	// Catch the Beat
	if (mode === 2) {
		if (rank < 100) {
			// 1 - 99
			role = '754087989717762080';
		} else if (rank < 500) {
			// 100 - 499
			role = '754088203534729276';
		} else if (rank < 10000) {
			// 500 - 9999
			role = '754088281674743858';
		} else if (rank < 50000) {
			// 10000 - 49999
			role = '754088358916915241';
		} else if (rank < 100000) {
			// 50000 - 99999
			role = '754088053101953034';
		} else {
			// 100000+
			role = '754089875157942435';
		}
	}

	// Mania
	if (mode === 3) {
		if (rank < 100) {
			// 1 - 99
			role = '754086656889585714';
		} else if (rank < 500) {
			// 100 - 499
			role = '754086784484376596';
		} else if (rank < 10000) {
			// 500 - 9999
			role = '754086852524507246';
		} else if (rank < 50000) {
			// 10000 - 49999
			role = '754086905825460265';
		} else if (rank < 100000) {
			// 50000 - 99999
			role = '754086720638681109';
		} else {
			// 100000+
			role = '754089662242357289';
		}
	}

	const roleList = [
		'754085973003993119',
		'754086188025118770',
		'754086290785304627',
		'754086299681685696',
		'754086107456471062',
		'754089529287245855',
		'754086656889585714',
		'754086784484376596',
		'754086852524507246',
		'754086905825460265',
		'754086720638681109',
		'754089662242357289',
		'754087013904547930',
		'754087748209475595',
		'754087814106448012',
		'754087911066173460',
		'754087679003721790',
		'754089750717136906',
		'754087989717762080',
		'754088203534729276',
		'754088281674743858',
		'754088358916915241',
		'754088053101953034',
		'754089875157942435',
	];

	roleList.forEach(r => {
		if (member.roles.cache.get(r)) {
			const rankRole = member.roles.cache.get(r).id;
			if (rankRole === role) return;
			member.roles.remove(r);
		}
	});
	member.roles.add(role);
};