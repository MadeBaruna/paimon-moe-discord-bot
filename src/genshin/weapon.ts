import { MessageEmbed } from 'discord.js';
import { weapons } from '@data/weapons';
import { weaponList as weaponMaterials } from '@data/weaponMaterials';
import { emoji } from './emoji';
import { itemGroup } from '@data/itemGroup';
import { format } from 'helper';

const secondary: {
  [key: string]: { name: string; multiplier: number; suffix: string };
} = {
  atk: { name: 'ATK', multiplier: 1, suffix: '' },
  atkPercent: { name: 'ATK%', multiplier: 100, suffix: '%' },
  physicalDamage: { name: 'Phys DMG%', multiplier: 100, suffix: '%' },
  critDamage: { name: 'CRIT Damage', multiplier: 100, suffix: '%' },
  critRate: { name: 'CRIT Rate', multiplier: 100, suffix: '%' },
  em: { name: 'Elemental Mastery', multiplier: 1, suffix: '' },
  er: { name: 'Energy Recharge', multiplier: 100, suffix: '%' },
};

export function generateWeaponEmbed(id: string): MessageEmbed {
  const embed = new MessageEmbed();
  const weapon = weapons[id];
  const weaponMaterial = (
    weaponMaterials as { [key: string]: typeof weaponMaterials.alley_hunter }
  )[id];

  embed.setThumbnail(`https://paimon.moe/images/weapons/${id}.png`);
  embed.setTitle(weapon.name);
  embed.setDescription(weapon.description);
  if (
    weapon.skill.name !== undefined &&
    weapon.skill.description !== undefined
  ) {
    embed.addField(
      weapon.skill.name,
      weapon.skill.description[4]
        .replace(/<span([^>+]*)>/g, '**')
        .replace(/<\/span[^>]*>/g, '**'),
    );
  }

  embed.addField('Type', weaponMaterial.type.name, true);
  embed.addField('Rarity', `${weapon.rarity} ⭐`, true);
  embed.addField(
    'Source',
    `${weaponMaterial.source[0].toUpperCase()}${weaponMaterial.source.substring(
      1,
    )}`,
    true,
  );
  embed.addField(
    'Base ATK',
    format(0, Number(weapon.atk[weapon.atk.length - 1])),
    true,
  );
  if (
    weapon.secondary.name !== undefined &&
    weapon.secondary.stats !== undefined
  ) {
    embed.addField(
      'Secondary Stat',
      `${secondary[weapon.secondary.name].name} ${format(
        1,
        (weapon.secondary.stats[weapon.secondary.stats.length - 1] ?? 0) *
          secondary[weapon.secondary.name].multiplier,
      )}${secondary[weapon.secondary.name].suffix}`,
      true,
    );
  }
  embed.addField('\u200B', '\u200B', true);

  const ascension = weaponMaterial.ascension[0].items
    .map((e) => `${emoji[e.item.id]} ${itemGroup[e.item.id].name}`)
    .join(' \u200B \u200B ');
  embed.addField('Ascensions Material', ascension);
  embed.setFooter('※ Stats numbers are at max level');

  return embed;
}
