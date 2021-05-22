import { Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import Command from '@bot/command';
import { search } from 'genshin/search';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export default class Genshin extends Command {
  constructor() {
    super({
      name: 'genshin',
      command: 'genshin',
    });
  }

  async run(message: Message, args: string): Promise<void> {
    if (args === ' help') {
      await message.channel.send(
        new MessageEmbed().setDescription(
          'Usage:\n' +
            '`/genshin` Show what items are farmable today\n' +
            '`/genshin <search query>` Show information about character build, weapon, or artifact' +
            '\n\n[Community Character Builds](https://tinyurl.com/genshinbuilds) by the Genshin Helper Team',
        ),
      );
    } else if (args === '') {
      await this.sendResult(message);
    } else {
      await search(args, message);
    }
  }

  private async sendResult(
    message: Message,
    sentMessage: Message | null = null,
    offsetDay: number = 0,
  ): Promise<void> {
    const result = this.getEmbed(offsetDay);

    let sent: Message;
    if (sentMessage != null) {
      sent = await sentMessage.edit(result.embed);
      await sent.reactions.removeAll();
    } else {
      sent = await message.channel.send(result.embed);
    }

    await sent.react('◀');
    await sent.react('▶');

    const filter = (reaction: MessageReaction, user: User): boolean =>
      ['◀', '▶'].includes(reaction.emoji.name ?? '') &&
      user.id !== sent.author.id;

    try {
      const reactions = await sent.awaitReactions(filter, {
        max: 1,
        time: 3600000,
      });
      const reaction = reactions.first();
      if (reaction?.emoji.name === '◀') {
        await this.sendResult(message, sent, offsetDay - 1);
      } else {
        await this.sendResult(message, sent, offsetDay + 1);
      }
    } catch (err) {
      console.log(err);
    }
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
      .setImage(`https://paimon.moe/images/daily/${today}.png?i=1`);

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
