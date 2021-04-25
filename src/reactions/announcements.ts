import Reaction from '@bot/reaction';
import { MessageReaction, PartialUser, User } from 'discord.js';

export default class AnnouncementsReactions extends Reaction {
  constructor() {
    super({
      name: 'role announcement reaction',
      key: 'announcement',
    });
  }

  async run(
    reaction: MessageReaction,
    user: User | PartialUser,
    type: 'add' | 'remove',
  ): Promise<void> {
    if (!['📢', '🔔'].includes(reaction.emoji.name)) {
      await reaction.remove();
      return;
    }

    const types: { [key: string]: string } = {
      '🔔': 'Dev Feed',
      '📢': 'Announcement',
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
