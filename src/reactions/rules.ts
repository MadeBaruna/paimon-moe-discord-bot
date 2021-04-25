import Reaction from '@bot/reaction';
import { MessageReaction, PartialUser, User } from 'discord.js';

export default class RulesReactions extends Reaction {
  constructor() {
    super({
      name: 'role accept rules',
      key: 'rules',
    });
  }

  async run(reaction: MessageReaction, user: User | PartialUser, type: 'add' | 'remove'): Promise<void> {
    if (type === 'remove') return;

    const role = reaction.message.guild?.roles.cache.find(e => e.name === 'Traveler');
    if (role === undefined) return;

    if (reaction.emoji.name !== '✅') {
      await reaction.remove();
      return;
    }

    const member = reaction.message.guild?.members.cache.find(e => e.id === user.id);
    void member?.roles.add(role);
  }
}
