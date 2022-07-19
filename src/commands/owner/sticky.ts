import { Message, MessageEmbed, TextChannel } from 'discord.js';
import Command from '@bot/command';
import { redis } from 'redis';
import { PAIMON_MOE_SERVER_ID } from '@config';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'set sticky message for a channel',
      command: 'sticky',
      ownerOnly: true,
    });
  }

  async run(message: Message, args: string): Promise<void> {
    const words = message.content.split(' ');
    const currentChannelId = message.channel.id;
    const source = words[1].split('/');
    const channelId = source[source.length - 2];
    const messageId = source[source.length - 1];

    const guild = message.guild;
    const sourceChannel = (await guild?.channels.fetch(
      channelId,
    )) as TextChannel;
    const sourceMessage = await sourceChannel.messages.fetch(messageId);

    const embed = new MessageEmbed();
    embed.setDescription(sourceMessage.content);
    const sent = await message.channel.send({ embeds: [embed] });

    await redis.hset(
      `discord:${PAIMON_MOE_SERVER_ID}:sticky`,
      currentChannelId,
      `${channelId},${messageId}`,
    );

    await redis.set(
      `discord:${PAIMON_MOE_SERVER_ID}:sticky:${sent.channel.id}`,
      sent.id,
    );

    await message.delete();
  }
}
