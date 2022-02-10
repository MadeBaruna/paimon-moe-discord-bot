import {
  ButtonInteraction,
  Message,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import { redis } from 'redis';
import Seedrandom from 'seedrandom';
import { PAIMON_MOE_SERVER_ID } from '@config';
import Button from '@bot/button';

const images = [
  'https://media.discordapp.net/attachments/938082061074464808/938124883169280050/unknown.png',
  'https://media.discordapp.net/attachments/938082061074464808/938621726496014346/image0.png',
  'https://media.discordapp.net/attachments/938082061074464808/938787861375905802/IMG_4348.jpg',
  'https://media.discordapp.net/attachments/938082061074464808/938965650024595557/20220203201358.png',
  'https://media.discordapp.net/attachments/938082061074464808/939741656482213958/20220206102113.png',
  'https://media.discordapp.net/attachments/938082061074464808/939779762891669524/SAVE_20220206_041729.jpg',
  'https://media.discordapp.net/attachments/938082061074464808/939947656795529226/20220207005750.png',
  'https://media.discordapp.net/attachments/938082061074464808/940248487168184350/20220207194104.png',
  'https://media.discordapp.net/attachments/938082061074464808/940252786308812800/20220207212702.png',
  'https://media.discordapp.net/attachments/938082061074464808/940436112785174549/image0.png',
];

export default class Help extends Button {
  constructor() {
    super({
      name: 'Photo Contest Vote',
      customId: 'paimon-moe-photo-contest',
    });
  }

  async interact(interaction: ButtonInteraction): Promise<void> {
    try {
      if (!interaction.deferred) {
        await interaction.deferReply({
          ephemeral: true,
        });
      }

      const likeButton = new MessageButton({
        customId: 'like',
        label: 'I LIKE THIS',
        emoji: '👍',
        style: 'SUCCESS',
      });

      const nextButton = new MessageButton({
        customId: 'next',
        label: 'Meh, NEXT',
        style: 'SECONDARY',
      });

      const row = new MessageActionRow({
        components: [likeButton, nextButton],
      });

      const userId = interaction.user.id;
      const votedImagesStr = await redis.hget(
        `discord:${PAIMON_MOE_SERVER_ID}:photocontest`,
        userId,
      );
      const votedImages = votedImagesStr === null ? 0 : Number(votedImagesStr);
      const currentImage = votedImages;

      if (currentImage === 10) {
        await interaction.editReply({
          content: '**You have voted all 10 photos, thank you!**',
        });

        return;
      }

      const rng = Seedrandom(userId);
      const random = Math.floor(rng() * 10);
      const selectedIndex = (random + currentImage) % 10;
      const selectedImage = images[selectedIndex];

      const msg = await interaction.editReply({
        files: [selectedImage],
        content: `**Vote Photo ${currentImage + 1} / 10**`,
        components: [row],
      });

      (msg as Message)
        .awaitMessageComponent({
          componentType: 'BUTTON',
          time: 3600 * 1000,
        })
        .then(async (result) => {
          if (result.customId === 'like') {
            await redis.zincrby(
              `discord:${PAIMON_MOE_SERVER_ID}:photocontestvote`,
              1,
              selectedIndex.toString(),
            );
          }

          const current = await redis.hincrby(
            `discord:${PAIMON_MOE_SERVER_ID}:photocontest`,
            userId,
            1,
          );
          if (current === 10) {
            await result.update({
              content: '**You have voted all 10 photos, thank you!**',
              components: [],
              files: [],
            });

            await redis.zincrby(
              `discord:${PAIMON_MOE_SERVER_ID}`,
              100,
              result.user.id,
            );

            return;
          }

          await result.update({
            content:
              '*Submitting your vote, please wait... (if this stuck please click the vote photo contest button again)*',
            components: [],
          });
          await this.interact(interaction);
        })
        .catch((err) => console.error(err));
    } catch (err) {
      console.error(err);
    }
  }
}
