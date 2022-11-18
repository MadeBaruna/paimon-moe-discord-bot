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

const images = [
  [
    '410194780090269706',
    'https://media.discordapp.net/attachments/1024463928408932473/1028644995298770944/20221009090749.png',
  ],
  [
    '491943470559264772',
    'https://media.discordapp.net/attachments/1024463928408932473/1037437407445909605/unknown.png',
  ],
  [
    '585444756100743187',
    'https://media.discordapp.net/attachments/1024463928408932473/1028415160840355881/sing.png',
  ],
  [
    '623970215000145921',
    'https://media.discordapp.net/attachments/1024463928408932473/1034810798477946962/unknown.png',
  ],
  [
    '662043488627589150',
    'https://media.discordapp.net/attachments/1024463928408932473/1035152878941249546/20221027225016.png',
  ],
  [
    '662088258586673212',
    'https://media.discordapp.net/attachments/1024463928408932473/1034384514354532362/20221025155203.png',
  ],
  [
    '674968396470812673',
    'https://media.discordapp.net/attachments/1024463928408932473/1030860491595206766/20221015221222.png',
  ],
  [
    '747695162720911360',
    'https://media.discordapp.net/attachments/1024463928408932473/1030514836825706596/20221014233519.png',
  ],
  [
    '755434546178162709',
    'https://media.discordapp.net/attachments/1024463928408932473/1031152294949048400/20221016172238.png',
  ],
  [
    '847698845387456522',
    'https://media.discordapp.net/attachments/1024463928408932473/1030743417640189983/20221015135338.png',
  ],
];

export default class Help extends Button {
  constructor() {
    super({
      name: 'Photo Contest Vote',
      customId: 'paimon-moe-photo-contest',
    });
  }

  async showVoting(
    interaction: ButtonInteraction,
    userId: string,
    random: number,
    skip = false,
  ): Promise<void> {
    const votedPhotos = await redis.smembers(
      `discord:${PAIMON_MOE_SERVER_ID}:photocontest-voted:${userId}`,
    );
    const userLevel = await getLevel(userId);
    const voteTimes = 2 + Math.floor(userLevel.level / 10);
    const voteLeft = voteTimes - votedPhotos.length;

    const buttons1 = [];
    const buttons2 = [];
    for (let i = 0; i < 5; i++) {
      const label = `${i + 1}`;
      const index = (i + random) % 10;
      const disabled = votedPhotos.includes(index.toString());
      buttons1.push(
        new MessageButton({
          label,
          customId: `paimon-moe-vote-photo-contest-${index}`,
          disabled,
          style: 'PRIMARY',
        }),
      );
    }
    for (let i = 0; i < 5; i++) {
      const label = `${i + 6}`;
      const index = (i + 5 + random) % 10;
      const disabled = votedPhotos.includes(index.toString());
      buttons2.push(
        new MessageButton({
          label,
          customId: `paimon-moe-vote-photo-contest-${index}`,
          disabled,
          style: 'PRIMARY',
        }),
      );
    }

    const voteEmbed = new MessageEmbed()
      .setTitle('Voting Time!')
      .setDescription(
        `Vote the photo you like, currently you can vote **${voteLeft} times**!\nSelect the photo number you want to vote:`,
      );

    if (skip) {
      await interaction.update({
        embeds: [voteEmbed],
        components:
          voteLeft === 0
            ? []
            : [
                new MessageActionRow().addComponents(buttons1),
                new MessageActionRow().addComponents(buttons2),
              ],
      });
      return;
    }

    await interaction.followUp({
      ephemeral: true,
      embeds: [voteEmbed],
      components:
        voteLeft === 0
          ? []
          : [
              new MessageActionRow().addComponents(buttons1),
              new MessageActionRow().addComponents(buttons2),
            ],
    });
  }

  async interact(interaction: ButtonInteraction): Promise<void> {
    const currentIndexStr = interaction.customId.substring(25);
    if (!interaction.deferred && currentIndexStr !== 'skip') {
      await interaction.deferReply({
        ephemeral: true,
      });
    }

    const userId = interaction.user.id;
    const rng = Seedrandom(userId);
    const random = Math.floor(rng() * 10);

    let currentIndex = random;
    if (currentIndexStr === 'skip') {
      await this.showVoting(interaction, userId, random, true);
      return;
    }
    if (currentIndexStr !== '') currentIndex = Number(currentIndexStr);

    const img1 = currentIndex % 10;
    const img2 = (currentIndex + 1) % 10;
    const imgNext = currentIndex + 2;

    const selectedImage1 = images[img1];
    const selectedImage2 = images[img2];

    let submissionUser1 = interaction.guild?.members.cache.get(
      selectedImage1[0],
    );
    if (submissionUser1 === undefined) {
      submissionUser1 = await interaction.guild?.members.fetch(
        selectedImage1[0],
      );
    }
    let submissionUser2 = interaction.guild?.members.cache.get(
      selectedImage2[0],
    );
    if (submissionUser2 === undefined) {
      submissionUser2 = await interaction.guild?.members.fetch(
        selectedImage2[0],
      );
    }

    const offsetNumber = currentIndex - random + 1;
    const embed1 = new MessageEmbed()
      .setTitle(`[${offsetNumber}] by ${submissionUser1?.displayName ?? ''}`)
      .setImage(selectedImage1[1]);
    const embed2 = new MessageEmbed()
      .setTitle(
        `[${offsetNumber + 1}] by ${submissionUser2?.displayName ?? ''}`,
      )
      .setImage(selectedImage2[1]);

    const button = new MessageButton({
      label: 'Show next photos',
      emoji: '⏩',
      customId: `paimon-moe-photo-contest-${imgNext}`,
      style: 'PRIMARY',
    });

    await interaction.editReply({
      content: 'Please see the 10 photos first 😀',
      embeds: [embed1, embed2],
      components:
        offsetNumber === 9
          ? []
          : [new MessageActionRow().addComponents(button)],
    });

    if (offsetNumber !== 9) return;

    await this.showVoting(interaction, userId, random);
  }
}
