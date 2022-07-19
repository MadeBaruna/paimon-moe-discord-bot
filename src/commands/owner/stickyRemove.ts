import { Message } from 'discord.js';
import Command from '@bot/command';
import { redis } from 'redis';
import { PAIMON_MOE_SERVER_ID } from '@config';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'remove sticky message for a channel',
      command: 'removesticky',
      ownerOnly: true,
    });
  }

  async run(message: Message, args: string): Promise<void> {
    const currentChannelId = message.channel.id;

    await redis.hdel(
      `discord:${PAIMON_MOE_SERVER_ID}:sticky`,
      currentChannelId,
    );

    await message.delete();
  }
}
