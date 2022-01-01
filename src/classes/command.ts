import {
  Message,
  CommandInteraction,
  PermissionResolvable,
  ApplicationCommandData,
  ApplicationCommandOptionData,
} from 'discord.js';
import { ownerId, prefix } from '../config';

export default abstract class Command {
  static commands: ApplicationCommandData[] = [];
  static serverOnlyCommands: ApplicationCommandData[] = [];

  name: string;
  command: string;
  permission?: PermissionResolvable;
  ownerOnly?: boolean;
  registerSlashCommand?: boolean;
  onlyInPaimonMoeServer?: boolean;

  constructor(config: {
    name: string;
    command: string;
    permission?: PermissionResolvable;
    ownerOnly?: boolean;
    registerSlashCommand?: boolean;
    onlyInPaimonMoeServer?: boolean;
    slashCommandOptions?: ApplicationCommandOptionData[];
  }) {
    this.name = config.name;
    this.command = config.command;
    this.permission = config.permission;
    this.ownerOnly = config.ownerOnly;
    this.registerSlashCommand = config.registerSlashCommand;
    this.onlyInPaimonMoeServer = config.onlyInPaimonMoeServer;

    if (config.registerSlashCommand === true) {
      if (config.onlyInPaimonMoeServer === true) {
        Command.serverOnlyCommands.push({
          name: this.command,
          description: this.name,
          options: config.slashCommandOptions,
        });
      } else {
        Command.commands.push({
          name: this.command,
          description: this.name,
          options: config.slashCommandOptions,
        });
      }
    }
  }

  check(message: Message): void {
    if (!message.content.startsWith(`${prefix}${this.command}`)) return;
    if (
      this.permission !== undefined &&
      message.member !== null &&
      this.ownerOnly === true &&
      message.author.id !== ownerId &&
      !message.member.permissions.has(this.permission)
    ) {
      return;
    }

    const args = message.content.substring(`${prefix}${this.command}`.length);
    void this.run(message, args);
  }

  checkInteraction(interaction: CommandInteraction): void {
    if (interaction.commandName !== this.command) return;
    void this.interact(interaction);
  }

  async run(message: Message, args: string): Promise<void> {
    return await Promise.reject(new Error('not implemented'));
  }

  async interact(interaction: CommandInteraction): Promise<void> {
    return await Promise.reject(new Error('not implemented'));
  }
}
