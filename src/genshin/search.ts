import Fuse from 'fuse.js';
import { characters } from '@data/characters';
import { weaponList } from '@data/weaponMaterials';
import { artifacts } from '@data/artifacts';
import { CommandInteraction } from 'discord.js';
import { generateArtifactEmbed } from './artifact';
import { generateWeaponEmbed } from './weapon';
import { generateBuildEmbed } from './character';

const searchable = [
  ...Object.entries(weaponList).map(([key, data]) => ({
    key,
    type: 'weapon',
    name: data.name,
  })),
  ...Object.entries(characters).map(([key, data]) => ({
    key,
    type: 'character',
    name: data.name,
  })),
  ...Object.entries(artifacts).map(([key, data]) => ({
    key,
    type: 'artifact',
    name: data.name,
  })),
];

const engine = new Fuse(searchable, {
  keys: ['name'],
});

export async function search(
  query: string,
  interaction: CommandInteraction,
): Promise<void> {
  const result = engine.search(query);

  if (result.length > 0) {
    const item = result[0].item;
    switch (item.type) {
      case 'artifact':
        await interaction.editReply({
          embeds: [generateArtifactEmbed(item.key)],
        });
        break;
      case 'weapon':
        await interaction.editReply({
          embeds: [generateWeaponEmbed(item.key)],
        });
        break;
      case 'character':
        await generateBuildEmbed(item.key, interaction);
        break;
    }
  } else {
    await interaction.editReply(`Cannot find something about ${query} 😕`);
  }
}
