import { CommandInteraction } from 'discord.js';
import Command from '@bot/command';

export default class Ticket extends Command {
  constructor() {
    super({
      name: 'This is just a command for your information',
      command: 'ticket',
      registerSlashCommand: true,
      onlyInPaimonMoeServer: true,
    });
  }

  async interact(interaction: CommandInteraction): Promise<void> {
    try {
      void interaction.reply({
        ephemeral: true,
        content:
          'There is no `/ticket` command! Use `/level` or `/giveaway` command!',
      });
    } catch (err) {
      console.error(err);
    }
  }
}
