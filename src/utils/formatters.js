module.exports = {
	formatDate: (year, month, day) => {
		const isValid = [year, month, day].every(
			(v) => typeof v === 'number' && !isNaN(v),
		);

		if (!isValid) return 'Unknown';

		const date = new Date(year, month - 1, day);
		if(isNaN(date.getTime())) return 'Unknown';

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
			.map(([key, value]) => `${key}: ${String(value).toLowerCase()}`)
			.join('\n');
		return shown || 'None';
	},
};