import { Message } from 'discord.js';
import Command from '@bot/command';
import { redis } from 'redis';
import { PAIMON_MOE_SERVER_ID } from 'config';

export default class GetRankLeaderboard extends Command {
  constructor() {
    super({
      name: 'get exp leaderboard',
      command: 'paimonexpleaderboard',
      ownerOnly: true,
    });
  }

  async run(message: Message): Promise<void> {
    try {
      const result = await redis.zrevrange(
        `discord:${PAIMON_MOE_SERVER_ID}`,
        0,
        30,
        'WITHSCORES',
      );

      await message.guild?.members.fetch();
      const leaderboard = result.reduce((prev, current, i) => {
        if (i % 2 === 1) {
          prev += ` ${current}\n`;
        } else {
          const user = message.guild?.members.cache.get(current);
          if (user !== undefined) {
            prev += user.displayName.substring(0, 30).padEnd(30, ' ');
          } else {
            prev += current.padEnd(30, ' ');
          }
        }

        return prev;
      }, '');

      await message.channel.send('```' + leaderboard + '```');
    } catch (err) {
      console.error(err);
    }
  }
}
