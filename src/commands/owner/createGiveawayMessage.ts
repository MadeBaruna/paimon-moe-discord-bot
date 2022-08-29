import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import Command from '@bot/command';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'create giveaway message button',
      command: 'ga:createcounter',
      ownerOnly: true,
    });
  }

  async run(message: Message, args: string): Promise<void> {
    const embed = new MessageEmbed();
    embed.setTitle('5x Blessing of the Welkin Moon Giveaway');
    embed.setDescription('Click the button below to join the giveaway!');
    embed.setColor('BLUE');

    const button = new MessageButton({
      customId: 'paimon-moe-giveaway-button',
      label: 'JOIN GIVEAWAY',
      emoji: '🎉',
      style: 'PRIMARY',
    });

    await message.delete();

    await message.channel.send({
      embeds: [embed],
      components: [new MessageActionRow().addComponents(button)],
    });
  }
}
