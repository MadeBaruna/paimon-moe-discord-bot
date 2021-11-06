import {
  Message,
  MessageEmbed,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import Command from '@bot/command';
import { search } from 'genshin/search';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { prefix } from '@config';
dayjs.extend(utc);

export default class Genshin extends Command {
  constructor() {
    super({
      name: 'Search Genshin Impact related stuff. Leave keyword empty to show what items are farmable today.',
      command: 'genshin',
      registerSlashCommand: true,
      slashCommandOptions: [
        {
          name: 'keyword',
          description: 'You can search about character, artifact, or weapon.',
          type: 'STRING',
        },
      ],
    });
  }

  async interact(interaction: CommandInteraction): Promise<void> {
    const keyword = interaction.options.get('keyword')?.value ?? '';
    if (keyword === 'help') {
      await interaction.reply({
        embeds: [
          new MessageEmbed().setDescription(
            'Usage:\n' +
              '`/genshin` Show what items are farmable today\n' +
              '`/genshin <search query>` Show information about character build, weapon, or artifact' +
              '\n\n[Community Character Builds](https://tinyurl.com/genshinbuilds) by the Genshin Helper Team',
          ),
        ],
      });
    } else if (keyword === '') {
      await this.sendResult(interaction);
    } else {
      await interaction.deferReply();
      await search(keyword as string, interaction);
    }
  }

  private async sendResult(interaction: CommandInteraction): Promise<void> {
    let offset = 0;
    const result = this.getEmbed();

    const row = new MessageActionRow().addComponents(
      new MessageButton({
        customId: 'farmable-prev',
        label: 'Previous',
        style: 'SECONDARY',
      }),
      new MessageButton({
        customId: 'farmable-next',
        label: 'Next',
        style: 'SECONDARY',
      }),
    );

    await interaction.reply({ embeds: [result.embed], components: [row] });
    const message = await interaction.fetchReply();

    const collector = (message as Message)?.createMessageComponentCollector({
      componentType: 'BUTTON',
      time: 15 * 60 * 1000,
    });

    collector?.on('collect', async (i) => {
      if (i.customId === 'farmable-prev') {
        const result = this.getEmbed(--offset);
        await i.update({
          embeds: [result.embed],
          components: [row],
        });
      } else {
        const result = this.getEmbed(++offset);
        await i.update({
          embeds: [result.embed],
          components: [row],
        });
      }
    });

    collector?.on('end', async () => {
      const result = this.getEmbed(offset);
      void (message as Message).edit({
        embeds: [result.embed],
        components: [
          new MessageActionRow().addComponents(
            new MessageButton({
              customId: 'farmable-stop',
              label: `type ${prefix}genshin to refresh`,
              style: 'SECONDARY',
              disabled: true,
            }),
          ),
        ],
      });
    });
  }

  private getEmbed(offsetDay: number = 0): {
    embed: MessageEmbed;
    today: string;
  } {
    const today = this.getCurrentDay(offsetDay);
    if (today === 'sunday') {
      const embed = new MessageEmbed()
        .setColor([254, 254, 254])
        .setTitle(
          `Genshin Impact Items: ${today.charAt(0).toUpperCase()}${today.slice(
            1,
          )}`,
        )
        .setDescription('Sunday can farm all items! 😀')
        .setURL('https://paimon.moe/items')
        .setFooter(
          'https://paimon.moe/items',
          'https://paimon.moe/favicon.png',
        );

      return { embed, today };
    }

    const embed = new MessageEmbed()
      .setColor([254, 254, 254])
      .setTitle(
        `Genshin Impact Items: ${today.charAt(0).toUpperCase()}${today.slice(
          1,
        )}`,
      )
      .setURL('https://paimon.moe/items')
      .setFooter('https://paimon.moe/items', 'https://paimon.moe/favicon.png')
      .setImage(`https://bot.paimon.moe/daily/${today}.png`);

    return { embed, today };
  }

  private getCurrentDay(offset: number = 0): string {
    const weekdays = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    const time = dayjs().utcOffset(8);
    let day = time.day();

    if (time.hour() >= 0 && time.hour() < 4) {
      day -= 1;
    }

    day += offset;

    if (day < 0) {
      day = 7 - (Math.abs(day) % 7);
    } else if (day > 6) {
      day = day % 7;
    }

    return weekdays[day];
  }
}
