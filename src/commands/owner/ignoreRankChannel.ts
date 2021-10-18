import { Message } from 'discord.js';
import Command from '@bot/command';
import { redis } from 'redis';
import { PAIMON_MOE_SERVER_ID } from 'config';

export default class IgnoreRankChannel extends Command {
  constructor() {
    super({
      name: 'ignore a channel for exp',
      command: 'setchannel:ignorerank',
      ownerOnly: true,
    });
  }

  async run(message: Message): Promise<void> {
    try {
      await redis.hset(
        `discord:${PAIMON_MOE_SERVER_ID}:ignored`,
        message.channelId,
        1,
      );
      await message.delete();
    } catch (err) {
      console.error(err);
    }
  }
}
