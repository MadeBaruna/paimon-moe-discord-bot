import { CommandInteraction } from 'discord.js';
import Command from '@bot/command';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'Call Paimon',
      command: 'ping',
      registerSlashCommand: true,
    });
  }

  async interact(interaction: CommandInteraction): Promise<void> {
    void interaction.reply({
      ephemeral: true,
      content: 'ehe te nandayo?!',
    });
  }
}
