import { Message } from 'discord.js';
import Command from '@bot/command';
import { updateMessages } from '@config';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'set dev feed channel',
      command: 'setchannel:devfeed',
      ownerOnly: true,
    });
  }

  async run(message: Message, args: string): Promise<void> {
    await updateMessages('devfeed', message.channel.id);
    await message.react('✅');
  }
}
