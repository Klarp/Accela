export async function messageHandler(interaction, content, page) {
	await interaction.editReply(content);
	const response = await interaction.fetchReply();

	const filter = (i) => i.user.id === interaction.user.id;
	const collector = response.createMessageComponentCollector({ filter, time: 120_000 });

	collector.on('collect', async i => {
		if (i.customId === 'ani_menu') {
			try {
				await i.deferUpdate();

				const selection = parseInt(i.values[0]);
				const newContent = await page.createMessage(selection);
				await interaction.editReply(newContent);
			} catch (error) {
				console.error('Failed to update media selection:', error);
			}
		}
	});

	collector.on('end', async () => {
		try {
			await interaction.editReply({ components: [] });
		} catch (error) {
			console.error('Failed to remove media menu:', error);
		}
	});
}