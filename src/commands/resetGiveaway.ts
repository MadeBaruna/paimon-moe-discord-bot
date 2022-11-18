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
      registerSlashCommand: true,
    });
  }

  async run(message: Message): Promise<void> {
    try {
      await this.deleteKey(`discord:${PAIMON_MOE_SERVER_ID}:*:giveaway.ticket`);
      await this.deleteKey(`discord:${PAIMON_MOE_SERVER_ID}:*:giveaway.roll`);
      await this.deleteKey(
        `discord:${PAIMON_MOE_SERVER_ID}:photocontest-voted:*`,
      );

      await redis.del(`discord:${PAIMON_MOE_SERVER_ID}:giveaway.ticket`);

      await message.reply({
        content: 'OK',
      });
    } catch (err) {
      console.error(err);
    }
  }

  async deleteKey(keyName: string): Promise<void> {
    try {
      let lastCursor = '0';
      do {
        const result = await redis.scan(
          lastCursor,
          'MATCH',
          keyName,
          'COUNT',
          1000,
        );

        lastCursor = result[0];

        for (const key of result[1]) {
          await redis.del(key);
        }
      } while (lastCursor !== '0');
    } catch (err) {
      console.error(err);
    }
  }
}
