import { Message, PermissionResolvable } from 'discord.js';
import { prefix } from '../config';

export default abstract class Command {
  name: string;
  command: string;
  permission?: PermissionResolvable;

  constructor(config: {
    name: string;
    command: string;
    permission?: PermissionResolvable;
  }) {
    this.name = config.name;
    this.command = config.command;
    this.permission = config.permission;
  }

  check(message: Message): void {
    if (!message.content.startsWith(`${prefix}${this.command}`)) return;
    if (
      this.permission !== undefined &&
      message.member !== null &&
      !message.member.permissions.has(this.permission)
    ) {
      return;
    }

    const args = message.content.substring(`${prefix}${this.command}`.length);
    void this.run(message, args);
  }

  abstract run(message: Message, args: string): Promise<void>;
}
