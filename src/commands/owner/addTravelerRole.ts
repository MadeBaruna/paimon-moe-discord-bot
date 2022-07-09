import { Message } from 'discord.js';
import Command from '@bot/command';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'add traveler role to member that doesnt already have it',
      command: 'fixrole:traveler',
      ownerOnly: true,
    });
  }

  async run(message: Message, args: string): Promise<void> {
    const members = await message.guild?.members.fetch();
    const role = message.guild?.roles.cache.find((e) => e.name === 'Traveler');
    if (role === undefined) return;

    const filtered = members?.filter((m) => !m.roles.cache.has(role.id));

    if (filtered !== undefined && filtered.size > 0) {
      filtered?.each((m) => {
        void m.roles.add(role.id);
      });
      await message.reply({
        content: `Added Traveler role to ${filtered.size} members`,
      });
    } else {
      await message.reply('All member already has Traveler role');
    }
  }
}
