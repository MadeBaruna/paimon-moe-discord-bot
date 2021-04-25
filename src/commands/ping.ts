import { Message } from 'discord.js';
import Command from '@bot/command';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'ping',
      command: 'ping',
    });
  }

  async run (message: Message, args: string): Promise<void> {
    void message.reply('pong');
  }
}
