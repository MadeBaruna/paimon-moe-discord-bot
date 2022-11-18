import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import Command from '@bot/command';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'create photo contest vote button',
      command: 'contest-votebutton',
      ownerOnly: true,
      registerSlashCommand: true,
    });
  }

  async interact(interaction: CommandInteraction): Promise<void> {
    const button = new MessageButton({
      customId: 'paimon-moe-photo-contest',
      label: 'VOTE PHOTO CONTEST',
      emoji: '📸',
      style: 'PRIMARY',
    });

    await interaction.reply({ ephemeral: true, content: 'ok' });

    await interaction.channel?.send({
      content: '**Press the button below to vote!**',
      components: [new MessageActionRow().addComponents(button)],
    });
  }
}
