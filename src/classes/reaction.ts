import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import { messages } from '@config';

export default abstract class Reaction {
  name: string;
  key: string;

  constructor(config: { name: string; key: string }) {
    this.name = config.name;
    this.key = config.key;
  }

  async check(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
    type: 'add' | 'remove',
  ): Promise<void> {
    const messageId = messages[this.key];

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error(
          'Something went wrong when fetching the message: ',
          error,
        );
        return;
      }
    }

    if (reaction.message.id !== messageId) return;

    void this.run(reaction as MessageReaction, user, type);
  }

  abstract run(
    reaction: MessageReaction,
    user: User | PartialUser,
    type: 'add' | 'remove',
  ): Promise<void>;
}
