import { CommandInteraction } from 'discord.js';
import Command from '@bot/command';
import { client } from 'client';

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
      content: `ehe te nandayo?!\n\nPaimon is on ${client.guilds.cache.size} servers`,
    });
  }
}
