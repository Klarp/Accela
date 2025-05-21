module.exports = {
	formatDate: (year, month, day) => {
		const date = new Date(year, month - 1, day);
		const formattedDate = date.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
		return formattedDate;
	},
	formatSelectedOptions: (options) => {
		const shown = Object.entries(options)
			.filter(([key, value]) =>
				value !== undefined &&
            value !== null &&
            value !== '' &&
            !['menuId', 'transform', 'search', 'type'].includes(key),
			)
			.map(([key, value]) => `${key}: ${value.toLowerCase()}`)
			.join('\n');
		return shown || 'None';
	},
};