import { ButtonInteraction } from 'discord.js';
import Button from '@bot/button';
import { getLevel } from 'libs/calculateLevel';
import { emoji } from 'genshin/emoji';

export default class Help extends Button {
  constructor() {
    super({
      name: 'Giveaway Info',
      customId: 'paimon-moe-giveaway-button',
    });
  }

  async interact(interaction: ButtonInteraction): Promise<void> {
    const userLevel = await getLevel(interaction.user.id);
    const giveawayMessage = `Currently you are level ${userLevel.level}, so you have joined the giveaway with **${userLevel.level}** ${emoji.ticket}\nCheck your exp by using \`/level\` command on <#844910701839122432>!`;
    await interaction.reply({
      ephemeral: true,
      content: giveawayMessage,
    });
  }
}
