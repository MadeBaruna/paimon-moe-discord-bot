import { CommandInteraction, MessageEmbed } from 'discord.js';
import Command from '@bot/command';
import { redis } from 'redis';
import { PAIMON_MOE_SERVER_ID } from '@config';

export default class Leaderboard extends Command {
  cache: null | string = null;

  constructor() {
    super({
      name: 'See this server rank leaderboard',
      command: 'leaderboard',
      registerSlashCommand: true,
      onlyInPaimonMoeServer: true,
    });
  }

  async interact(interaction: CommandInteraction): Promise<void> {
    try {
      const isCooldown = await redis.get(
        `discord:${PAIMON_MOE_SERVER_ID}:leaderboard`,
      );
      if (this.cache !== null && isCooldown !== null) {
        await interaction.reply({
          embeds: [
            new MessageEmbed({
              description: '```' + this.cache + '```',
              title: 'Paimon.moe Discord Leaderboard',
            }),
          ],
        });
        return;
      }

      const result = await redis.zrevrange(
        `discord:${PAIMON_MOE_SERVER_ID}`,
        0,
        20,
        'WITHSCORES',
      );

      await interaction.guild?.members.fetch();
      let leaderboard = '';

      for (let i = 0; i < result.length; i++) {
        const current = result[i];
        if (i % 2 === 0) {
          const user = interaction.guild?.members.cache.get(current);
          const level =
            (await redis.get(
              `discord:${PAIMON_MOE_SERVER_ID}:${current}:level`,
            )) ?? 0;
          leaderboard += `LVL ${level} - `;
          if (user !== undefined) {
            leaderboard += user.displayName;
          } else {
            leaderboard += current;
          }
          leaderboard += '\n';
        }
      }

      this.cache = leaderboard;

      await redis.set(
        `discord:${PAIMON_MOE_SERVER_ID}:leaderboard`,
        1,
        'EX',
        3600,
      );

      await interaction.reply({
        embeds: [
          new MessageEmbed({
            description: '```' + leaderboard + '```',
            title: 'Paimon.moe Discord Leaderboard',
            footer: {
              text: 'Updated every hour',
            },
          }),
        ],
      });
    } catch (err) {
      console.error(err);
    }
  }
}
