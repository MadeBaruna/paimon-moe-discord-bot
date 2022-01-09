import { Message, TextChannel } from 'discord.js';
import Command from '@bot/command';

export default class PostChannel extends Command {
  constructor() {
    super({
      name: 'post to channel',
      command: 'postchannel',
      ownerOnly: true,
    });
  }

  async run(message: Message, args: string): Promise<void> {
    try {
      const words = message.content.split(' ');
      const channelId = words[1];
      const content = words.slice(2).join(' ').replace(/\[n\]/g, '\n');
      const channel = await message.guild?.channels.cache
        .get(channelId)
        ?.fetch();
      await (channel as TextChannel).send(content);
    } catch (err) {
      console.error(err);
    }
  }
}
