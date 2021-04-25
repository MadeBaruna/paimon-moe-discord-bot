import Reaction from '@bot/reaction';
import { MessageReaction, PartialUser, User } from 'discord.js';

export default class WorldLevelReactions extends Reaction {
  constructor() {
    super({
      name: 'role world level reaction',
      key: 'worldlevel',
    });
  }

  async run(
    reaction: MessageReaction,
    user: User | PartialUser,
    type: 'add' | 'remove',
  ): Promise<void> {
    if (
      !['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'].includes(
        reaction.emoji.name,
      )
    ) {
      await reaction.remove();
      return;
    }

    const types: { [key: string]: string } = {
      '1️⃣': 'WL1',
      '2️⃣': 'WL2',
      '3️⃣': 'WL3',
      '4️⃣': 'WL4',
      '5️⃣': 'WL5',
      '6️⃣': 'WL6',
      '7️⃣': 'WL7',
      '8️⃣': 'WL8',
    };

    const role = reaction.message.guild?.roles.cache.find(
      (e) => e.name === types[reaction.emoji.name],
    );
    if (role === undefined) return;

    const member = reaction.message.guild?.members.cache.find(
      (e) => e.id === user.id,
    );

    if (type === 'add') {
      void member?.roles.add(role);
    } else {
      void member?.roles.remove(role);
    }
  }
}
