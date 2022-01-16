import { Message } from 'discord.js';
import Command from '@bot/command';
import { redis } from 'redis';
import { PAIMON_MOE_SERVER_ID } from 'config';

export default class ResetGiveaway extends Command {
  constructor() {
    super({
      name: 'reset giveaway',
      command: 'resetgiveaway',
      ownerOnly: true,
    });
  }

  async run(message: Message): Promise<void> {
    try {
      let lastCursor = '0';
      do {
        const result = await redis.scan(
          lastCursor,
          'MATCH',
          `discord:${PAIMON_MOE_SERVER_ID}:*:giveaway.ticket`,
          'COUNT',
          1000,
        );

        lastCursor = result[0];

        for (const key of result[1]) {
          await redis.del(key);
        }
      } while (lastCursor !== '0');

      lastCursor = '0';
      do {
        const result = await redis.scan(
          lastCursor,
          'MATCH',
          `discord:${PAIMON_MOE_SERVER_ID}:*:giveaway.roll`,
          'COUNT',
          1000,
        );

        lastCursor = result[0];

        for (const key of result[1]) {
          await redis.del(key);
        }
      } while (lastCursor !== '0');

      await redis.del(`discord:${PAIMON_MOE_SERVER_ID}:giveaway.ticket`);

      await message.reply({
        content: 'OK',
      });
    } catch (err) {
      console.error(err);
    }
  }
}
