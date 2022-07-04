import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  CommandInteraction,
  HexColorString,
  Message,
} from 'discord.js';
import { characters as chars } from '@data/characters';
import { builds } from '@data/builds';
import { weapons } from '@data/weapons';
import { artifacts } from '@data/artifacts';
import { prefix } from '@config';

const colors: { [key: string]: HexColorString } = {
  anemo: '#A6F4CC',
  cryo: '#74D6D9',
  pyro: '#FCA66F',
  geo: '#F2D35F',
  electro: '#AF76D7',
  hydro: '#15CDDF',
};

const characters = chars as {
  [key: string]: typeof chars.amber;
};

function getArtifactName(id: string): string {
  if (id === '+18%_atk_set') return 'ATK +18% Set';
  else if (id === '+20%_energy_recharge') return 'ER +20% Set';
  else if (id === '+25%_physical_dmg') return 'Physical DMG +25% Set';
  else return artifacts[id].name;
}

function getEmbed(
  id: string,
  index: number,
): { embed: MessageEmbed; buildNames: string[] } {
  const embed = new MessageEmbed();

  const character = characters[id];
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
    embed.setDescription(
      data.note.replace(/<b>/g, '**').replace(/<\/b>/g, '**'),
    );
  }
  embed.addField(
    'MAIN STATS',
    `**Sands:** ${data.mainStats.sands.join(
      ' / ',
    )}\n**Goblet:** ${data.mainStats.goblet.join(
      ' / ',
    )}\n**Circlet:** ${data.mainStats.circlet.join(' / ')}`,
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
        let stack = '';
        if (e.refine !== undefined) {
          if (Array.isArray(e.refine)) {
            refine = ` [R${e.refine.join('-')}] `;
          } else {
            refine = ` [R${e.refine}] `;
          }
        }
        if (e.stack !== undefined) {
          stack = ` [S${e.stack}] `;
        }

        return `**${i + 1}.** ${weapons[e.id].name}${refine}${stack}(${
          weapons[e.id].rarity
        }★)`;
      })
      .join('\n'),
    true,
  );
  embed.addField(
    'ARTIFACT',
    data.artifacts
      .map((e, i) => {
        let str;
        if (e.length > 2) {
          str =
            '**Choose 2:** ' +
            e.map((f) => `${getArtifactName(f)} (2)`).join(' / ');
        } else if (e.length > 1) {
          str = `${getArtifactName(e[0])} (2) ${getArtifactName(e[1])} (2)`;
        } else {
          str = `${getArtifactName(e[0])} (4)`;
        }
        return `**${i + 1}.** ${str}`;
      })
      .join('\n'),
    true,
  );
  if (data.tip !== '') embed.addField('ABILITY TIP', data.tip);

  return {
    embed,
    buildNames: build.map((e) => `${e[0]}${e[1].recommended ? ' 👍' : ''}`),
  };
}

export async function generateBuildEmbed(
  id: string,
  interaction: CommandInteraction,
): Promise<void> {
  let index = 0;

  const { embed, buildNames } = getEmbed(id, index);

  if (buildNames.length > 1) {
    const buttons = buildNames.map(
      (e, i) =>
        new MessageButton({
          customId: `characterbuild-${i}`,
          label: e,
          style: 'SECONDARY',
        }),
    );

    buttons.forEach((e, i) => {
      e.disabled = i === index;
    });
    const row = new MessageActionRow().addComponents(...buttons);
    embed.setFooter('Press button below to see other build');
    const message = await interaction.editReply({
      embeds: [embed],
      components: [row],
    });

    const collector = (message as Message).createMessageComponentCollector({
      componentType: 'BUTTON',
      time: 15 * 60 * 1000,
    });

    collector?.on('collect', async (i) => {
      if (i.customId.startsWith('characterbuild-')) {
        index = Number(i.customId.substring('characterbuild-'.length));
        const { embed } = getEmbed(id, index);
        embed.setFooter('Press button below to see other build');
        buttons.forEach((e, i) => {
          e.disabled = i === index;
        });
        const row = new MessageActionRow().addComponents(...buttons);
        try {
          await i.update({
            embeds: [embed],
            components: [row],
          });
        } catch (err) {}
      }
    });

    collector?.on('end', async (i) => {
      const { embed } = getEmbed(id, index);
      void (message as Message).edit({
        embeds: [embed],
        components: [
          new MessageActionRow().addComponents(
            new MessageButton({
              customId: 'farmable-stop',
              label: `type ${prefix}genshin ${characters[id].name} to refresh`,
              style: 'SECONDARY',
              disabled: true,
            }),
          ),
        ],
      });
    });
  } else {
    await interaction.editReply({ embeds: [embed] });
  }
}
