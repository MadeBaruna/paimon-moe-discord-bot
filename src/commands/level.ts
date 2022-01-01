import { CommandInteraction } from 'discord.js';
import Command from '@bot/command';
import { getLevel } from 'libs/calculateLevel';
import { emoji } from 'genshin/emoji';
import { chatExp } from '@data/chatExp';

const expArray = Object.entries(chatExp);

export default class Level extends Command {
  constructor() {
    super({
      name: 'Get your level in this Discord server',
      command: 'level',
      registerSlashCommand: true,
      onlyInPaimonMoeServer: true,
    });
  }

  async interact(interaction: CommandInteraction): Promise<void> {
    try {
      const { level, currentExp } = await getLevel(interaction.user.id);
      const nextExpNeeded = expArray[level + 1][0];
      void interaction.reply({
        ephemeral: true,
        content: `You are **LEVEL ${level}** ${emoji.exp}\n**EXP** ${currentExp}/${nextExpNeeded}`,
      });
    } catch (err) {
      console.error(err);
    }
  }
}
