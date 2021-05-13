import { MessageEmbed } from 'discord.js';
import { artifacts } from '@data/artifacts';

export function generateArtifactEmbed(id: string): MessageEmbed {
  const embed = new MessageEmbed();
  const artifact = artifacts[id];

  embed.setThumbnail(`https://paimon.moe/images/artifacts/${id}_flower.png`);
  embed.setTitle(artifact.name);

  const descriptions = [];
  for (let i = 0; i < artifact.bonuses.length; i++) {
    const bonus = artifact.bonuses[i]; 
    descriptions.push(`**${artifact.setPiece[i]} Piece Bonus**: ${bonus}`);
  }
  embed.setDescription(descriptions.join('\n'));

  embed.addField('Rarity', `${artifact.rarity.join('/')} ⭐`);

  return embed;
}
