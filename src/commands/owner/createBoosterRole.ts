import { GuildEmoji, Message } from 'discord.js';
import Command from '@bot/command';
import { characters } from '@data/characters';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'create booster role',
      command: 'role:booster',
      ownerOnly: true,
    });
  }

  async run(message: Message, args: string): Promise<void> {
    const charEmojis: { [key: string]: GuildEmoji } = {};
    message.guild?.emojis.cache.each((e) => {
      if (e.name === null) return;
      charEmojis[e.name] = e;
    });

    const oldRoles = await message.guild?.roles.cache.filter((e) =>
      e.name.startsWith('Booster - '),
    );
    if (oldRoles !== undefined) {
      for (const [, role] of oldRoles) {
        await role.delete();
      }
    }

    for (const [, char] of Object.entries(characters)) {
      await message.guild?.roles.create({
        color: 'GOLD',
        name: `Booster - ${char.name}`,
        icon: charEmojis[char.name],
      });
    }

    await message.react('✅');
  }
}
