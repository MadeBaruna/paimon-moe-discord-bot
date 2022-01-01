import { Message, MessageEmbed } from 'discord.js';
import Command from '@bot/command';
import { updateMessages } from '@config';
import { emoji } from 'genshin/emoji';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'create giveaway message ticket counter',
      command: 'giveaway:createcounter',
      ownerOnly: true,
    });
  }

  async run(message: Message, args: string): Promise<void> {
    const embed = new MessageEmbed();
    embed.setTitle('5x Blessing of the Welkin Moon Giveaway');
    embed.setDescription(
      `${emoji.ticket} Ticket Count: **0**\n\nType \`/giveaway\` on <#844910701839122432> to join the giveaway!`,
    );
    embed.setColor('BLUE');

    await message.delete();

    const sent = await message.channel.send({ embeds: [embed] });

    await updateMessages('giveawaycounter', sent.id);
  }
}
