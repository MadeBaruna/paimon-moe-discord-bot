import { Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import { characters } from '@data/characters';
import { builds } from '@data/builds';
import { weapons } from '@data/weapons';
import { artifacts } from '@data/artifacts';

const colors: { [key: string]: string } = {
  anemo: '#A6F4CC',
  cryo: '#74D6D9',
  pyro: '#FCA66F',
  geo: '#F2D35F',
  electro: '#AF76D7',
  hydro: '#15CDDF',
};

const reactions = ['1️⃣', '2️⃣', '3️⃣'];

export async function generateBuildEmbed(
  id: string,
  index: number,
  message: Message,
  sentMessage?: Message,
): Promise<void> {
  const embed = new MessageEmbed();

  const character = (
    characters as {
      [key: string]: typeof characters.amber;
    }
  )[id];

  const current = builds[id];

  const build = Object.entries(current.roles).sort((a, b) =>
    a[1].recommended === b[1].recommended ? 0 : a[1].recommended ? -1 : 1,
  );

  const title = build[index][0];
  const data = build[index][1];

  embed.setAuthor(
    `${character.name}`,
    `https://paimon.moe/images/characters/${id}.png`,
    `https://paimon.moe/characters/${id}`,
  );
  embed.setColor(colors[character.element.id]);
  embed.setTitle(`${title}${data.recommended ? ' 👍' : ''}`);
  if (data.note !== undefined) {
    embed.setDescription(data.note.replace(/\n/g, '\n\n'));
  }
  embed.addField(
    'MAIN STATS',
    `**Sands:** ${data.mainStats.sands}\n**Goblet:** ${data.mainStats.goblet}\n**Circlet:** ${data.mainStats.circlet}`,
    true,
  );
  embed.addField(
    'SUB STATS',
    data.subStats.map((e, i) => `**${i + 1}.** ${e}`).join('\n'),
    true,
  );
  embed.addField(
    'TALENT PRIORITY',
    data.talent.map((e, i) => `**${i + 1}.** ${e}`).join('\n'),
    true,
  );
  embed.addField(
    'WEAPON',
    data.weapons
      .map((e, i) => {
        let refine = ' ';
        if (e.refine !== undefined) {
          if (Array.isArray(e.refine)) {
            refine = ` [R${e.refine.join('-')}] `;
          } else {
            refine = ` [R${e.refine}] `;
          }
        }
        return `**${i + 1}.** ${weapons[e.id].name}${refine}(${
          weapons[e.id].rarity
        }⭐)`;
      })
      .join('\n'),
    true,
  );
  embed.addField(
    'ARTIFACT',
    data.artifacts
      .map((e, i) => {
        let str;
        if (e.length > 1) {
          str = `${artifacts[e[0]].name} (2) ${artifacts[e[1]].name} (2)`;
        } else {
          str = `${artifacts[e[0]].name} (4)`;
        }
        return `**${i + 1}.** ${str}`;
      })
      .join('\n'),
    true,
  );
  if (data.tip !== '') embed.addField('ABILITY TIP', data.tip);

  const roles = build.map((e) => e[0]);
  if (roles.length > 1) {
    const reactionsAvailable = reactions.slice(0, roles.length);
    reactionsAvailable.splice(index, 1);

    roles.splice(index, 1);

    embed.setFooter(
      `React ${reactionsAvailable
        .map((e, i) => `${e} for ${roles[i]} Build`)
        .join(', ')}`,
    );

    let msg: Message;

    if (sentMessage != null) {
      msg = await sentMessage.edit(embed);
    } else {
      msg = await message.channel.send(embed);
    }

    await msg.reactions.removeAll();
    for (const emoji of reactionsAvailable) {
      await msg.react(emoji);
    }

    const filter = (reaction: MessageReaction, user: User): boolean =>
      reactionsAvailable.includes(reaction.emoji.name ?? '') &&
      user.id !== msg.author.id;

    try {
      const reacts = await msg.awaitReactions(filter, {
        max: 1,
        time: 3600000,
      });
      const reaction = reacts.first();
      if (reaction !== undefined) {
        const emojiIndex = reactions.indexOf(reaction.emoji.name ?? '');
        if (emojiIndex > -1) {
          await generateBuildEmbed(id, emojiIndex, message, msg);
        }
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    await message.channel.send(embed);
  }
}
