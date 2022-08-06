import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { redis } from 'redis';
import Seedrandom from 'seedrandom';
import { PAIMON_MOE_SERVER_ID } from '@config';
import Button from '@bot/button';
import { getLevel } from 'libs/calculateLevel';
import { emoji } from 'genshin/emoji';

export default class Help extends Button {
  constructor() {
    super({
      name: 'Photo Contest Vote',
      customId: 'paimon-moe-vote-photo-contest',
    });
  }

  async interact(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.deferred) {
      await interaction.deferUpdate();
    }

    const userId = interaction.user.id;
    const rng = Seedrandom(userId);
    const random = Math.floor(rng() * 10);

    console.log(random);

    const votedPhotos = await redis.smembers(
      `discord:${PAIMON_MOE_SERVER_ID}:photocontest-voted:${userId}`,
    );
    const userLevel = await getLevel(userId);
    const voteTimes = 2 + Math.floor(userLevel.level / 10);
    let voteLeft = voteTimes - votedPhotos.length;

    const ticketOwned =
      (await redis.get(
        `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.ticket`,
      )) ?? 0;

    if (voteLeft === 0) {
      const cantVoteEmbed = new MessageEmbed().setDescription(
        `Sorry you cannot vote anymore.\nYou have ${ticketOwned} ${emoji.ticket} !`,
      );
      await interaction.editReply({
        embeds: [cantVoteEmbed],
      });
      return;
    }

    const votedId = interaction.customId.substring(30);
    console.log('VOTING', votedId);

    await redis.zincrby(
      `discord:${PAIMON_MOE_SERVER_ID}:photocontest-score`,
      1,
      votedId,
    );

    await redis.sadd(
      `discord:${PAIMON_MOE_SERVER_ID}:photocontest-voted:${userId}`,
      votedId,
    );

    const totalTicket = await redis.incr(
      `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.ticket`,
    );

    voteLeft -= 1;

    const embed = new MessageEmbed()
      .setTitle('Voting Time!')
      .setDescription(
        `Thanks for voting, you got a Ticket ${emoji.ticket}!\nCurrently you have ${totalTicket} ${emoji.ticket} and can vote **${voteLeft}** more times!`,
      );

    const voteAgainButton = new MessageButton({
      label: 'VOTE AGAIN',
      emoji: '📸',
      customId: 'paimon-moe-photo-contest-skip',
      style: 'PRIMARY',
    });

    await interaction.editReply({
      embeds: [embed],
      components:
        voteLeft === 0
          ? []
          : [new MessageActionRow().addComponents(voteAgainButton)],
    });
  }
}
