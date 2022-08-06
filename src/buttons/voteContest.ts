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
    '218659683752345600',
    'https://media.discordapp.net/attachments/998190351712002048/999440379868880998/20220721051043.png',
  ],
  [
    '251407021163675648',
    'https://media.discordapp.net/attachments/998190351712002048/1001828195085074442/20220727191647.png',
  ],
  [
    '462536588132614145',
    'https://media.discordapp.net/attachments/998190351712002048/1004358953934790696/20220801184700.png',
  ],
  [
    '530786534069108765',
    'https://media.discordapp.net/attachments/998190351712002048/1002264353887764531/SAVE_20220728_143811.jpg',
  ],
  [
    '540189891435167748',
    'https://media.discordapp.net/attachments/998190351712002048/1001226883825942579/20220725223653.png',
  ],
  [
    '577366940557770762',
    'https://media.discordapp.net/attachments/998190351712002048/999380983117783170/20220721005138.png',
  ],
  [
    '697064578290286642',
    'https://media.discordapp.net/attachments/998190351712002048/999204227463249950/20220718123355.png',
  ],
  [
    '747794126606696458',
    'https://media.discordapp.net/attachments/998190351712002048/1004088693490991156/20220802025128.png',
  ],
  [
    '847698845387456522',
    'https://media.discordapp.net/attachments/998190351712002048/1001120487516164167/20220725201615.png',
  ],
  [
    '850749430781050970',
    'https://media.discordapp.net/attachments/998190351712002048/999668582587826236/20220721172346.png',
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
      selectedImage1[0],
    );
    if (submissionUser2 === undefined) {
      submissionUser2 = await interaction.guild?.members.fetch(
        selectedImage1[0],
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
    console.log('RANDOM', random, img1, img2);

    await interaction.editReply({
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
