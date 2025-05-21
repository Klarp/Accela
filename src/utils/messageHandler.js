async function messageHandler(interaction, content, page) {
	await interaction.reply(content);
	const response = await interaction.fetchReply();

	const filter = (i) => i.user.id === interaction.user.id;
	const collector = response.createMessageComponentCollector({ filter, time: 120_000 });

	collector.on('collect', async i => {
		if (i.customId === 'ani_menu') {
			const selection = parseInt(i.values[0]);
			const newContent = await page.createMessage(selection);

			await interaction.editReply(newContent);
			await i.deferUpdate();
		} else if (i.customId === 'mal_menu') {
			const selection = parseInt(i.values[0]);
			const newContent = await page.createMessage(selection);

			await interaction.editReply(newContent);
			await i.deferUpdate();
		}
	});

	collector.on('end', async () => {
		await interaction.editReply({ components: [] });
	});
}

module.exports = { messageHandler };