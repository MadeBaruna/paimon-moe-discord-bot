import { CommandInteraction, MessageEmbed } from 'discord.js';
import Command from '@bot/command';

export default class Help extends Command {
  constructor() {
    super({
      name: 'Show available commands for Paimon',
      command: 'help',
      registerSlashCommand: true,
    });
  }

  async interact(interaction: CommandInteraction): Promise<void> {
    void interaction.reply({
      embeds: [
        new MessageEmbed().setDescription(
          '`/genshin` Show what items are farmable today\n' +
            '`/genshin <search query>` Show information about character build, weapon, or artifact' +
            '\n\n[Community Character Builds](https://tinyurl.com/genshinbuilds) by the Genshin Helper Team',
        ),
      ],
    });
  }
}
