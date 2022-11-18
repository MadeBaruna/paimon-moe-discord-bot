import { Message, MessageActionRow, MessageButton } from 'discord.js';
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

  async run(message: Message, args: string): Promise<void> {
    await message.delete();

    const button = new MessageButton({
      customId: 'paimon-moe-photo-contest',
      label: 'VOTE PHOTO CONTEST',
      emoji: '📸',
      style: 'PRIMARY',
    });

    await message.channel.send({
      content: '**Press the button below to vote!**',
      components: [new MessageActionRow().addComponents(button)],
    });
  }
}
